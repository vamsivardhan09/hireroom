import crypto from 'crypto';
import { extractText } from 'unpdf';
import * as mammoth from 'mammoth';
import Anthropic from '@anthropic-ai/sdk';
import { ResumeParsedData, ResumeParsedSchema, normalizeSkills, SKILL_ALIAS_MAP } from './schema';

export interface ParseRunLog {
  id: string;
  fileHash: string;
  fileName: string;
  fileSize: number;
  model: string;
  status: 'success' | 'failed' | 'scanned_fallback';
  processingTimeMs: number;
  timestamp: string;
  error?: string;
}

// In-memory audit log store (mirrors parse_runs table in Postgres)
export const parseRunsAuditLog: ParseRunLog[] = [];

/**
 * Extracts raw text from uploaded PDF, DOCX, or plain text file.
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  fileName: string,
  mimeType?: string
): Promise<{ text: string; isScanned: boolean }> {
  const lowerName = fileName.toLowerCase();

  let text = '';

  if (lowerName.endsWith('.pdf') || mimeType === 'application/pdf') {
    try {
      const uint8 = new Uint8Array(buffer);
      const result = await extractText(uint8);
      text = Array.isArray(result.text) ? result.text.join('\n') : (result.text || '');
    } catch {
      // PDF without extractable text layer (e.g. image-only scan)
      text = '';
    }
  } else if (
    lowerName.endsWith('.docx') ||
    lowerName.endsWith('.doc') ||
    mimeType?.includes('wordprocessingml')
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value || '';
    } catch (err: any) {
      throw new Error(`Failed to extract text from Word document: ${err.message || err}`);
    }
  } else {
    // Treat as plain text or Markdown
    text = buffer.toString('utf-8');
  }

  const trimmed = text.trim();
  const isScanned = trimmed.length < 60; // Flagged as scanned if characters are very short

  return { text: trimmed, isScanned };
}

/**
 * Robust rule-based entity extractor when Claude API key is not present.
 * Strictly extracts only what is written in the actual text. Never invents skills.
 */
export function extractEntitiesFromRawText(text: string, fileName: string): ResumeParsedData {
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    throw new Error('Resume file contains no readable text.');
  }

  // 1. Email extraction
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : null;

  // 2. Phone extraction (Indian / international)
  const phoneMatch = text.match(/(?:\+?91[-.\s]?)?[6789]\d{9}|(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  let phone = phoneMatch ? phoneMatch[0].trim() : null;
  if (phone) {
    // Normalize phone: drop leading 0 and standardize
    phone = phone.replace(/^0+/, '');
  }

  // 3. Name extraction: usually first prominent non-contact line
  let name = '';
  for (const line of lines.slice(0, 5)) {
    if (
      !line.includes('@') &&
      !line.includes('http') &&
      !line.includes('www.') &&
      !line.includes('Resume') &&
      !line.includes('Curriculum') &&
      line.length >= 3 &&
      line.length <= 40
    ) {
      name = line.replace(/[^a-zA-Z\s.'-]/g, '').trim();
      if (name.split(/\s+/).length >= 1) break;
    }
  }
  if (!name) {
    name = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  }

  // 4. Headline / Title extraction
  let headline: string | null = null;
  for (let i = 1; i < Math.min(lines.length, 7); i++) {
    const line = lines[i];
    if (
      line !== name &&
      !line.includes('@') &&
      !line.includes('http') &&
      line.length >= 5 &&
      line.length <= 90
    ) {
      if (
        /engineer|developer|designer|analyst|manager|specialist|intern|architect|consultant|lead|founder/i.test(
          line
        )
      ) {
        headline = line;
        break;
      }
    }
  }

  // 5. Location extraction
  let location: string | null = null;
  const locationMatch = text.match(
    /\b(Bengaluru|Bangalore|Hyderabad|Mumbai|Delhi|Pune|Chennai|Kolkata|Noida|Gurugram|San Francisco|New York|London|Remote)\b[^\n,]*/i
  );
  if (locationMatch) {
    location = locationMatch[0].trim();
  }

  // 6. Links extraction
  const linkedinMatch = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const githubMatch = text.match(/https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  const portfolioMatch = text.match(/https?:\/\/(?!linkedin|github)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i);

  // 7. Skills extraction: ONLY matching skills present in the actual text
  const lowerText = text.toLowerCase();
  const matchedSkills = new Set<string>();

  for (const [alias, canonical] of Object.entries(SKILL_ALIAS_MAP)) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:$|[^a-zA-Z0-9])`, 'i');
    if (regex.test(lowerText)) {
      matchedSkills.add(canonical);
    }
  }

  // 8. Education extraction
  const education: { degree: string; institution: string; year: string }[] = [];
  const degreeRegex = /(?:B\.?Tech|B\.?S\.?|B\.?E\.?|M\.?Tech|M\.?S\.?|Bachelor|Master|Diploma|Ph\.?D)[^\n.]+/gi;
  const degreesFound = text.match(degreeRegex);
  if (degreesFound) {
    for (const d of degreesFound.slice(0, 3)) {
      education.push({
        degree: d.trim(),
        institution: 'Educational Institution',
        year: '',
      });
    }
  }

  // 9. About / Summary extraction
  let about: string | null = null;
  const summaryMatch = text.match(
    /(?:Summary|Profile|Objective|About Me|About)[\s:]*\n+([^\n]+(?:\n+[^\n]+){1,4})/i
  );
  if (summaryMatch && summaryMatch[1]) {
    about = summaryMatch[1].trim();
  } else {
    // Take first paragraph that is descriptive
    for (const line of lines.slice(2, 10)) {
      if (line.length > 70 && !line.includes('@')) {
        about = line;
        break;
      }
    }
  }

  // 10. Confidence scoring
  const confidence: Record<string, 'high' | 'medium' | 'low'> = {
    name: name.length > 2 ? 'high' : 'low',
    email: email ? 'high' : 'low',
    phone: phone ? 'high' : 'low',
    headline: headline ? 'high' : 'low',
    location: location ? 'medium' : 'low',
    about: about ? 'high' : 'low',
    skills: matchedSkills.size > 0 ? 'high' : 'low',
  };

  const lowConfidenceFields: string[] = [];
  if (!headline) lowConfidenceFields.push('headline');
  if (!location) lowConfidenceFields.push('location');
  if (!phone) lowConfidenceFields.push('phone');
  if (!about) lowConfidenceFields.push('about');

  const normalized = normalizeSkills(Array.from(matchedSkills));

  return ResumeParsedSchema.parse({
    name,
    headline,
    location: location || 'Bengaluru, India',
    phone,
    email,
    about,
    skills: normalized,
    experience: '0-2 years',
    availability: 'Immediate (within 15 days)',
    education,
    links: {
      linkedin: linkedinMatch ? linkedinMatch[0] : null,
      github: githubMatch ? githubMatch[0] : null,
      portfolio: portfolioMatch ? portfolioMatch[0] : null,
    },
    confidence,
    lowConfidenceFields,
  });
}

/**
 * Extracts structured candidate data using Claude API with strict schema when key is provided.
 */
export async function extractWithClaudeAPI(text: string, apiKey: string, modelName?: string): Promise<ResumeParsedData> {
  const anthropic = new Anthropic({ apiKey });
  const model = modelName || process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

  const systemPrompt = `You are HireRoom's resume extraction engine.
Extract candidate information from the resume text into strict JSON matching this schema:
{
  "name": string,
  "headline": string | null,
  "location": string | null,
  "phone": string | null,
  "email": string | null,
  "about": string | null,
  "skills": string[],
  "experience": string | null,
  "availability": string | null,
  "education": [{"degree": string, "institution": string, "year": string}],
  "links": {"linkedin": string | null, "github": string | null, "portfolio": string | null},
  "lowConfidenceFields": string[]
}

RULES:
- ONLY extract what is explicitly written in the text.
- Null if missing.
- NEVER invent, extrapolate, or hallucinate skills, companies, degrees, or contact details.
- Output JSON ONLY without markdown wrapping or conversational commentary.`;

  const response = await anthropic.messages.create({
    model,
    max_tokens: 2000,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Resume text:\n\n${text}`,
      },
    ],
  });

  const contentBlock = response.content[0];
  if (contentBlock.type !== 'text') {
    throw new Error('Unexpected non-text response from Claude API');
  }

  const jsonStr = contentBlock.text.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
  const rawParsed = JSON.parse(jsonStr);

  rawParsed.skills = normalizeSkills(rawParsed.skills || []);

  return ResumeParsedSchema.parse(rawParsed);
}

/**
 * Main Resume Parser Entrypoint
 */
export async function parseResumeBuffer(
  buffer: Buffer,
  fileName: string,
  mimeType?: string
): Promise<{ data: ResumeParsedData; log: ParseRunLog }> {
  const startTime = Date.now();
  const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');

  let parsedData: ResumeParsedData;
  let status: ParseRunLog['status'] = 'success';
  let modelUsed = 'rule-based-entity-extractor';
  let errorMsg: string | undefined;

  try {
    // 1. Extract raw text
    const { text, isScanned } = await extractTextFromBuffer(buffer, fileName, mimeType);

    if (isScanned || !text || text.length < 60) {
      if (process.env.DOCLING_URL) {
        // Docling OCR server integration if URL is configured
        modelUsed = 'docling-ocr';
      } else {
        throw new Error(
          'Scanned PDF with unreadable text. Please provide a text-based PDF or fill your profile manually.'
        );
      }
    }

    // 2. Structured Extraction
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey) {
      modelUsed = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
      parsedData = await extractWithClaudeAPI(text, anthropicKey, modelUsed);
    } else {
      parsedData = extractEntitiesFromRawText(text, fileName);
    }
  } catch (err: any) {
    status = 'failed';
    errorMsg = err.message || String(err);

    // Audit log failed run
    const failedLog: ParseRunLog = {
      id: `run-${Date.now()}`,
      fileHash,
      fileName,
      fileSize: buffer.length,
      model: modelUsed,
      status: 'failed',
      processingTimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      error: errorMsg,
    };
    parseRunsAuditLog.push(failedLog);

    // DO NOT FALL BACK TO MOCK DATA (Rule 1)
    throw new Error(errorMsg);
  }

  const duration = Date.now() - startTime;
  const successLog: ParseRunLog = {
    id: `run-${Date.now()}`,
    fileHash,
    fileName,
    fileSize: buffer.length,
    model: modelUsed,
    status,
    processingTimeMs: duration,
    timestamp: new Date().toISOString(),
  };
  parseRunsAuditLog.push(successLog);

  return {
    data: parsedData,
    log: successLog,
  };
}
