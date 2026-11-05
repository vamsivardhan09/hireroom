import { test, expect } from '@playwright/test';
import { parseResumeBuffer, parseRunsAuditLog } from '../src/lib/resume/parser';

test.describe('Step R2: Real Resume Parsing Pipeline', () => {
  // Test Resumes as Buffers
  const engineerResumeText = `
Alex Chen
Senior Full-Stack Engineer
Bengaluru, India | alex.chen@example.com | +91 9876543210
https://github.com/alexchen-dev | https://linkedin.com/in/alexchen

Summary:
Passionate full-stack developer with 5 years of experience building scalable distributed web applications and cloud architectures.

Skills:
TypeScript, React, Next.js, Node.js, Python, PostgreSQL, Docker, Redis, GraphQL, AWS

Experience:
Senior Software Engineer at HyperScale Tech (2021 - Present)
- Designed and built high-throughput microservices using Node.js and PostgreSQL.
- Optimized frontend Next.js applications reducing bundle size by 40%.

Education:
B.Tech in Computer Science - Indian Institute of Technology, Madras (2017 - 2021)
`;

  const designerResumeText = `
Maya Sen
Product Designer & Design Systems Lead
Mumbai, India | maya.sen@designstudio.io | +91 9123456789
https://mayasen.design | https://linkedin.com/in/mayasen

About:
Crafting intuitive, accessible mobile and web experiences. 4+ years leading design systems and user research for consumer fintech.

Core Competencies:
Figma, UI/UX Design, Prototyping, Wireframing, After Effects, User Research, HTML5, CSS3

Experience:
Lead Product Designer at ZenPay (2022 - Present)
- Designed design system components utilized across 4 web and mobile apps in Figma.

Education:
Bachelor of Design - National Institute of Design (2018 - 2022)
`;

  const plainTextResumeText = `
Karan Patel
Growth Marketer & Data Analyst
Delhi, India | karan.growth@gmail.com | +91 9988776655
https://linkedin.com/in/karanpatel-growth

Summary:
Data-driven performance marketer specializing in user acquisition funnels, conversion optimization, and analytics pipelines.

Skills & Tools:
SQL, Python, Power BI, Tableau, SEO, Google Analytics

Education:
B.S. in Economics - Delhi University (2019 - 2022)
`;

  test('1. Parses Engineer resume correctly with technical skills and contact info', async () => {
    const buffer = Buffer.from(engineerResumeText, 'utf-8');
    const { data, log } = await parseResumeBuffer(buffer, 'alex_chen_engineer.txt', 'text/plain');

    expect(data.name).toBe('Alex Chen');
    expect(data.headline).toContain('Full-Stack');
    expect(data.email).toBe('alex.chen@example.com');
    expect(data.skills).toContain('TypeScript');
    expect(data.skills).toContain('React');
    expect(data.skills).toContain('PostgreSQL');
    expect(data.skills).toContain('Docker');
    expect(data.links.github).toBe('https://github.com/alexchen-dev');

    // Audit log verification
    expect(log.status).toBe('success');
    expect(log.fileHash).toBeTruthy();
    expect(log.processingTimeMs).toBeGreaterThanOrEqual(0);
  });

  test('2. Parses Designer resume correctly with design competencies', async () => {
    const buffer = Buffer.from(designerResumeText, 'utf-8');
    const { data, log } = await parseResumeBuffer(buffer, 'maya_sen_designer.txt', 'text/plain');

    expect(data.name).toBe('Maya Sen');
    expect(data.headline).toContain('Product Designer');
    expect(data.email).toBe('maya.sen@designstudio.io');
    expect(data.skills).toContain('Figma');
    expect(data.skills).toContain('UI/UX Design');
    expect(data.skills).toContain('Prototyping');
    expect(data.skills).not.toContain('Docker'); // Proves no invented skills

    expect(log.status).toBe('success');
  });

  test('3. Parses Plain-text resume correctly with analytics skills', async () => {
    const buffer = Buffer.from(plainTextResumeText, 'utf-8');
    const { data, log } = await parseResumeBuffer(buffer, 'karan_patel_growth.txt', 'text/plain');

    expect(data.name).toBe('Karan Patel');
    expect(data.headline).toContain('Marketer');
    expect(data.email).toBe('karan.growth@gmail.com');
    expect(data.skills).toContain('SQL');
    expect(data.skills).toContain('Power BI');
    expect(data.skills).not.toContain('Figma');
  });

  test('4. Proves 3 different resumes return 3 genuinely DIFFERENT profiles', async () => {
    const res1 = await parseResumeBuffer(Buffer.from(engineerResumeText), 'engineer.txt');
    const res2 = await parseResumeBuffer(Buffer.from(designerResumeText), 'designer.txt');
    const res3 = await parseResumeBuffer(Buffer.from(plainTextResumeText), 'marketer.txt');

    // Names must be different
    expect(res1.data.name).not.toBe(res2.data.name);
    expect(res2.data.name).not.toBe(res3.data.name);
    expect(res1.data.name).not.toBe(res3.data.name);

    // Emails must be different
    expect(res1.data.email).not.toBe(res2.data.email);
    expect(res2.data.email).not.toBe(res3.data.email);

    // Skills must differ according to domain
    expect(res1.data.skills).toContain('React');
    expect(res2.data.skills).not.toContain('React');
    expect(res2.data.skills).toContain('Figma');
    expect(res1.data.skills).not.toContain('Figma');
    expect(res3.data.skills).toContain('Power BI');
    expect(res1.data.skills).not.toContain('Power BI');
  });

  test('5. Scanned PDF with unreadable text throws clear error and does NOT silently fall back to mock data', async () => {
    // Simulated scanned PDF with only a few unreadable glyphs (< 20 chars)
    const scannedBuffer = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\nx y z', 'utf-8');

    await expect(
      parseResumeBuffer(scannedBuffer, 'scanned_document.pdf', 'application/pdf')
    ).rejects.toThrow(/Scanned PDF with unreadable text/);
  });

  test('6. Verifies parse_runs audit log records every run with hash, status, and timing', async () => {
    // Perform a sample parse to ensure audit log has an entry in this test process
    const sampleBuffer = Buffer.from('Jane Doe\nSoftware Engineer\njane@example.com\nSkills: Python, Go', 'utf-8');
    await parseResumeBuffer(sampleBuffer, 'jane_doe.txt', 'text/plain');

    expect(parseRunsAuditLog.length).toBeGreaterThan(0);
    const lastRun = parseRunsAuditLog[parseRunsAuditLog.length - 1];

    expect(lastRun).toHaveProperty('fileHash');
    expect(lastRun).toHaveProperty('fileName');
    expect(lastRun).toHaveProperty('status');
    expect(lastRun).toHaveProperty('processingTimeMs');
    expect(lastRun).toHaveProperty('timestamp');
  });
});
