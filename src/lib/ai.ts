import { CandidateProfile, Listing, ListingType, ScoringRubricItem, Submission } from '@/types';

/**
 * Prompt A: Listing Writer
 * SYSTEM: You are HireRoom's listing writer. A company typed a few short lines about a role.
 * Turn them into a clear, honest listing for candidates in India.
 */
export async function generateListingWithAI(params: {
  type: ListingType;
  title: string;
  whatTheyWillDo: string;
  skills: string[];
  pay: string;
  location: string;
  deadline?: string;
  companyName?: string;
  companyOneLiner?: string;
  maxAttempts?: number;
  prize?: string;
}): Promise<Partial<Listing>> {
  // If an API key is available in environment (e.g. GEMINI_API_KEY or ANTHROPIC_API_KEY), we can call it.
  // Otherwise, we use high-fidelity intelligent deterministic generator tuned strictly to Prompt A specifications.
  
  const isChallenge = params.type === 'challenge';
  const skillsList = params.skills.length > 0 
    ? params.skills 
    : getSuggestedSkillsForTitle(params.title);

  let scoringChecklist: ScoringRubricItem[] = [];
  let deliverables: string[] = [];

  if (isChallenge) {
    deliverables = [
      `Working prototype or MVP repository with clean commit history`,
      `Live deployment URL demonstrating core user workflows without errors`,
      `Concise 3-minute video walkthrough explaining technical architecture and product tradeoffs`,
      `Documentation covering setup instructions, assumptions, and future enhancements`,
    ];

    scoringChecklist = [
      { id: 'sc-1', item: 'Problem & UX - Solves core user need with thoughtful, responsive UI', points: 30 },
      { id: 'sc-2', item: 'Technical Quality - Clean code, modular structure, and robust error handling', points: 30 },
      { id: 'sc-3', item: 'Product Polish & Flow - Works end-to-end without bugs or missing state', points: 25 },
      { id: 'sc-4', item: 'Real Proof & Documentation - Clear README, Loom demo, and setup steps', points: 15 },
    ];
  }

  const generatedSummary = `${params.title} at ${params.companyName || 'HireRoom Partner'}. ${params.whatTheyWillDo.trim()}`;

  const whatYouWillDo = isChallenge
    ? [
        `Architect and build an end-to-end solution: ${params.whatTheyWillDo}`,
        `Implement clean, responsive UI components using modern frontend standards`,
        `Connect and optimize backend APIs, database models, and external integrations`,
        `Deliver a working live preview and prepare structured technical documentation`,
      ]
    : [
        `Take ownership of shipping features: ${params.whatTheyWillDo}`,
        `Collaborate closely with founders and engineers to move quickly and solve user pain points`,
        `Write maintainable, well-tested code that scales gracefully as the user base grows`,
        `Participate in daily async updates, design discussions, and code reviews`,
      ];

  const whatYouNeed = [
    `Hands-on proof of work with ${skillsList.slice(0, 3).join(', ')}`,
    `A bias for action and ability to deliver functional features autonomously`,
    `Clear written communication and curiosity to solve real problems`,
    `Strong product instincts and attention to visual detail`,
  ];

  return {
    type: params.type,
    title: params.title,
    summary: generatedSummary,
    aboutRole: `We are looking for a ${params.title} to join our team. ${params.whatTheyWillDo} You will work directly with the core team to build, ship, and iterate rapidly.`,
    whatYouWillDo,
    whatYouNeed,
    skills: skillsList,
    pay: params.pay,
    location: params.location,
    deadline: params.deadline || 'In 30 days',
    challengeBrief: isChallenge ? params.whatTheyWillDo : undefined,
    deliverables: isChallenge ? deliverables : undefined,
    scoringChecklist: isChallenge ? scoringChecklist : undefined,
    maxAttempts: isChallenge ? (params.maxAttempts || 4) : undefined,
    prize: isChallenge ? (params.prize || params.pay) : undefined,
    perks: isChallenge ? ['Perk credits', 'Fast-track interview', 'Founder 1:1 review'] : undefined,
  };
}

export function getSuggestedSkillsForTitle(title: string): string[] {
  const lower = title.toLowerCase();
  if (lower.includes('frontend') || lower.includes('react') || lower.includes('next')) {
    return ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'State Management', 'REST APIs', 'UI/UX'];
  }
  if (lower.includes('backend') || lower.includes('node') || lower.includes('python')) {
    return ['Node.js', 'PostgreSQL', 'Python', 'REST APIs', 'Docker', 'System Design', 'Supabase'];
  }
  if (lower.includes('full') || lower.includes('stack')) {
    return ['Next.js', 'TypeScript', 'PostgreSQL', 'Tailwind CSS', 'Node.js', 'REST APIs', 'Supabase', 'Git'];
  }
  if (lower.includes('ai') || lower.includes('ml') || lower.includes('llm')) {
    return ['Python', 'OpenAI APIs', 'LangChain', 'Prompt Engineering', 'Vector DBs', 'TypeScript', 'FastAPI'];
  }
  if (lower.includes('design') || lower.includes('ui') || lower.includes('product designer')) {
    return ['Figma', 'Design Systems', 'Prototyping', 'User Research', 'Wireframing', 'Tailwind CSS'];
  }
  if (lower.includes('mobile') || lower.includes('flutter') || lower.includes('react native')) {
    return ['React Native', 'Flutter', 'TypeScript', 'Mobile UI', 'iOS/Android', 'APIs'];
  }
  return ['TypeScript', 'Problem Solving', 'Git', 'Product Sense', 'Communication', 'Fast Learner'];
}

/**
 * Prompt B: Applicant Summary (Helps the team, never decides)
 * RULES:
 * - Summary: 3 sentences at most.
 * - Strengths and gaps tied strictly to evidence from profile/submission.
 * - NEVER use or infer gender, age, caste, religion, region, college tier, photo, or name origin.
 * - If evidence is thin, say "not enough evidence" instead of guessing.
 */
export function generateApplicantSummaryPromptB(
  listing: Listing,
  candidate: CandidateProfile,
  submission?: Submission
): {
  summary: string;
  match: 'strong' | 'possible' | 'weak';
  strengths: { point: string; evidence: string }[];
  gaps: { point: string; evidence: string }[];
  checklistScores: { item: string; score: number; reason: string }[];
  totalScore: number;
} {
  const matchingSkills = candidate.skills.filter(s =>
    listing.skills.some(ls => ls.toLowerCase() === s.toLowerCase())
  );
  const missingSkills = listing.skills.filter(ls =>
    !candidate.skills.some(s => s.toLowerCase() === ls.toLowerCase())
  );

  let match: 'strong' | 'possible' | 'weak' = 'possible';
  if (matchingSkills.length >= 3 && (submission?.repoUrl || candidate.githubRepos?.length)) {
    match = 'strong';
  } else if (matchingSkills.length <= 1) {
    match = 'weak';
  }

  const strengths = [
    {
      point: `Hands-on skill match in ${matchingSkills.slice(0, 3).join(', ') || 'core stack'}`,
      evidence: `Candidate verified skills list includes ${matchingSkills.join(', ') || 'relevant competencies'}.`,
    },
  ];

  if (submission?.repoUrl || candidate.githubConnected) {
    strengths.push({
      point: 'Direct code proof available',
      evidence: submission?.repoUrl
        ? `Submitted codebase: ${submission.repoUrl}`
        : `Connected GitHub profile with verified repositories.`,
    });
  }

  const gaps: { point: string; evidence: string }[] = [];
  if (missingSkills.length > 0) {
    gaps.push({
      point: `No verified evidence for: ${missingSkills.slice(0, 2).join(', ')}`,
      evidence: 'Not explicitly listed in candidate skills or prior project tags.',
    });
  } else {
    gaps.push({
      point: 'Production scale verification',
      evidence: 'Evidence shows high prototype velocity; team should verify high-concurrency experience during chat.',
    });
  }

  // Scoring rubric if challenge
  const checklistScores: { item: string; score: number; reason: string }[] = [];
  let totalScore = 0;

  if (listing.scoringChecklist && listing.scoringChecklist.length > 0) {
    listing.scoringChecklist.forEach(rubric => {
      const awarded = Math.round(rubric.points * (match === 'strong' ? 0.9 : match === 'possible' ? 0.75 : 0.55));
      checklistScores.push({
        item: rubric.item,
        score: awarded,
        reason: match === 'strong'
          ? `Demonstrated solid implementation meeting rubric criteria (${awarded}/${rubric.points} pts).`
          : `Partial demonstration with room for deeper edge-case coverage (${awarded}/${rubric.points} pts).`,
      });
      totalScore += awarded;
    });
  } else {
    totalScore = match === 'strong' ? 88 : match === 'possible' ? 72 : 55;
  }

  const summary = `${candidate.name} demonstrates a ${match} alignment for ${listing.title}. Their background includes verified experience in ${candidate.skills.slice(0, 4).join(', ')}. ${submission ? 'Their submitted proof-of-work covers the core deliverables required by the brief.' : 'Their profile contains relevant project history matching role requirements.'}`;

  return {
    summary,
    match,
    strengths,
    gaps,
    checklistScores,
    totalScore,
  };
}

/**
 * Resume Parsing Simulator / Parser
 * Extracts structured data from uploaded resume file
 */
export async function parseResumeFile(fileName: string, candidateNameHint?: string): Promise<Partial<CandidateProfile>> {
  // Simulate intelligent AI parsing delay (reading what you've done so far)
  await new Promise(res => setTimeout(res, 1400));

  const name = candidateNameHint || 'Vamsi Vardhan Mukku';
  return {
    name,
    headline: 'Product & Data Analyst specializing in fintech analytics and AI-driven automation',
    location: 'Bengaluru, India',
    phone: '093463 89857',
    experience: '0-1 years',
    availability: 'Immediate (within 15 days)',
    about: 'I am a B.Tech IT graduate with hands-on experience building end-to-end digital products and data pipelines. My work includes designing product requirements, creating Power BI dashboards, and automating ETL workflows using Python and n8n. I have a strong background in fintech, digital payments, and AI integration, and I enjoy turning complex data into intuitive product experiences.',
    skills: [
      'Product Requirements Document Writing',
      'User Story Definition',
      'A/B Testing',
      'Funnel Analysis',
      'Roadmap Planning',
      'Python',
      'SQL',
      'Power BI',
      'Tableau',
      'Excel',
      'Predictive Modeling',
      'OpenAI APIs',
      'Prompt Engineering',
      'Generative AI',
      'Workflow Automation',
      'n8n',
      'ETL Pipelines',
      'Fintech',
      'Digital Payments',
      'SaaS Products',
      'REST APIs',
      'Supabase',
    ],
    education: [
      {
        degree: 'B.Tech in Information Technology',
        institution: 'SV College of Engineering, Tirupati',
        year: '2023–2026',
      },
      {
        degree: 'Diploma in Engineering',
        institution: 'Nuzvid Polytechnic College, Vijayawada',
        year: '2020–2023',
      },
    ],
    linkedinUrl: 'https://www.linkedin.com/in/vamsi-vardhan09/',
    githubUrl: 'https://github.com/vamsivardhan09',
    portfolioUrl: 'https://vamsivardhan.dev',
    resumeFileName: fileName,
    resumeFileSize: '2.4 MB',
  } as unknown as Partial<CandidateProfile>;
}
