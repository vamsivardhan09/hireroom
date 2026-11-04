'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Company,
  Listing,
  CandidateProfile,
  Application,
  Submission,
  CampfireRoom,
  CampfireMessage,
  UserRole,
} from '@/types';
import { generateApplicantSummaryPromptB } from './ai';

interface HireRoomStoreContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  
  candidateProfile: CandidateProfile;
  updateCandidateProfile: (updates: Partial<CandidateProfile>) => void;
  
  companies: Company[];
  addCompany: (company: Omit<Company, 'id' | 'createdDaysAgo'>) => Company;
  
  listings: Listing[];
  addListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'viewsCount' | 'applicantsCount'>) => Listing;
  updateListing: (id: string, updates: Partial<Listing>) => void;
  
  applications: Application[];
  applyToListing: (listingId: string, screeningAnswers?: Record<string, string>) => Application;
  updateApplicationStatus: (id: string, status: Application['status']) => void;
  
  submissions: Submission[];
  addSubmission: (submission: Omit<Submission, 'id' | 'submittedAt' | 'totalScore'>) => Submission;
  
  campfireRooms: CampfireRoom[];
  messages: CampfireMessage[];
  sendMessage: (roomId: string, body: string, isPinned?: boolean) => void;
  
  // Stats
  candidateStats: {
    totalApplications: number;
    inReview: number;
    shortlisted: number;
    accepted: number;
  };
}

const defaultCandidateProfile: CandidateProfile = {
  userId: 'user-cand-1',
  name: 'Vamsi Vardhan Mukku',
  headline: 'Product & Data Analyst specializing in fintech analytics and AI-driven automation',
  location: 'Bengaluru, India',
  phone: '+91 093463 89857',
  experience: '0-1 years',
  availability: 'Immediate (within 15 days)',
  about: 'I am a B.Tech IT graduate with hands-on experience building end-to-end digital products and data pipelines. My work includes designing product requirements, creating Power BI dashboards, and automating ETL workflows using Python and n8n.',
  skills: [
    'Product Requirements Document Writing',
    'User Story Definition',
    'A/B Testing',
    'Funnel Analysis',
    'Roadmap Planning',
    'Stakeholder Management',
    'SQL',
    'Python',
    'Pandas',
    'Power BI',
    'Prompt Engineering',
    'Generative AI',
    'Workflow Automation',
    'n8n',
    'Supabase',
    'REST APIs',
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
  resumeFileName: 'vamsi_vardhan_resume.pdf',
  resumeFileSize: '2.4 MB',
  githubConnected: true,
  githubUsername: 'vamsivardhan09',
  githubRepos: [
    {
      id: 'repo-1',
      name: 'fanbase-operating-system',
      description: 'Next.js 15 link-in-bio platform with AI agent for influencer audience curation',
      stars: 14,
      language: 'TypeScript',
      url: 'https://github.com/vamsivardhan09/fanbase-operating-system',
      updatedAt: '2 hours ago',
    },
    {
      id: 'repo-2',
      name: 'fintech-etl-automation',
      description: 'Automated data ingestion pipeline using Python, Supabase, and n8n',
      stars: 8,
      language: 'Python',
      url: 'https://github.com/vamsivardhan09/fintech-etl-automation',
      updatedAt: '3 days ago',
    },
    {
      id: 'repo-3',
      name: 'hireroom-client',
      description: 'Lightweight hiring client and application tracker',
      stars: 5,
      language: 'TypeScript',
      url: 'https://github.com/vamsivardhan09/hireroom-client',
      updatedAt: 'Just now',
    },
  ],
  portfolioUrl: 'https://vamsivardhan.dev',
  linkedinUrl: 'https://www.linkedin.com/in/vamsi-vardhan09/',
  targetRoles: ['Full-time employment', 'Internship', 'Founder role'],
  referralSource: 'LinkedIn',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

const initialCompanies: Company[] = [
  {
    id: 'comp-1',
    name: 'Persist Ventures',
    website: 'https://persist.ventures',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    oneLiner: 'Venture studio building and scaling high-conviction AI & creator economy products.',
    city: 'Bengaluru',
    isRemote: true,
    size: '11-50',
    verified: true,
    status: 'active',
    createdDaysAgo: 45,
  },
  {
    id: 'comp-2',
    name: 'Corpvance',
    website: 'https://corpvance.ai',
    logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80',
    oneLiner: 'Autonomous workflow engines and intelligent document pipelines for high-growth enterprises.',
    city: 'Remote - USA / India',
    isRemote: true,
    size: '51-200',
    verified: true,
    status: 'active',
    createdDaysAgo: 60,
  },
  {
    id: 'comp-3',
    name: 'Face Search AI',
    website: 'https://facesearch.ai',
    logo: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100&auto=format&fit=crop&q=80',
    oneLiner: 'Privacy-first edge computer vision and identity verification APIs.',
    city: 'Hyderabad',
    isRemote: true,
    size: '1-10',
    verified: true,
    status: 'active',
    createdDaysAgo: 20,
  },
];

const initialListings: Listing[] = [
  {
    id: 'list-1',
    companyId: 'comp-1',
    companyName: 'Persist Ventures',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    companyVerified: true,
    type: 'challenge',
    title: 'Build the Operating System for Fanbases',
    summary: 'Creators with big followings have overflowing inboxes. Build an AI-assisted link-in-bio hub with automated opportunity routing.',
    aboutRole: 'Creators with big followings have overflowing inboxes, and "pay to message me" wastes the value sitting in them. Their followers share interests and could build and act together if something coordinated them. Build that product: a link-in-bio hub with an AI representative that organizes opportunities from the network, plus a dashboard where fans pitch ideas and creators rally them around actions.',
    whatYouWillDo: [
      'Design and build a working MVP: a link-in-bio hub that coordinates a creator’s followers',
      'Build an AI representative that organizes and categorizes the creator’s inbox and opportunities',
      'Build a coordination dashboard where fans can pitch ideas and ventures and creators can direct fan action',
      'Get at least one real influencer or community to test the product',
      'Make your own product decisions from a high-level brief',
    ],
    whatYouNeed: [
      'Ability to ship a working full-stack product end to end',
      'Experience building with LLMs and AI APIs',
      'Founder mindset: you take ownership, work with ambiguity, and build to solve real pain',
      'Willingness to do outreach and get the product in front of real creators',
    ],
    skills: ['Full-Stack', 'Next.js', 'LLM', 'Product', 'Community', 'Founder'],
    pay: '$250 cash + 10% equity',
    location: 'Remote',
    isRemote: true,
    deadline: 'Nov 30, 12:00 AM',
    status: 'live',
    challengeBrief: 'Influencers and creators with large audiences receive thousands of messages, ideas, and collaboration requests every day. Build a platform that helps influencers organize their audience into meaningful communities, surface valuable opportunities, and create a better way for creators to interact.',
    deliverables: [
      'Working MVP repository (Next.js/React + Supabase/Node)',
      'Live deployment URL (Vercel, Railway, or similar)',
      '3-minute Loom walkthrough video explaining features & user journey',
      'Brief documentation of technical architecture and creator setup flow',
    ],
    scoringChecklist: [
      { id: 'sc-1', item: 'Problem & UX - Solves the influencer inbox/community problem with a simple experience', points: 30 },
      { id: 'sc-2', item: 'Community & AI - Effectively organizes followers and uses AI to surface valuable ideas', points: 30 },
      { id: 'sc-3', item: 'Execution - Functional, polished, and demonstrates real-world potential', points: 25 },
      { id: 'sc-4', item: 'Real Influencer Validation - Priority will be given to products tested by a real creator with feedback', points: 15 },
    ],
    maxAttempts: 4,
    prize: '$250',
    equity: '10%',
    perks: ['Claude Code', 'Cursor', 'Codex', 'AWS credits'],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    viewsCount: 1420,
    applicantsCount: 18,
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'list-2',
    companyId: 'comp-2',
    companyName: 'Corpvance',
    companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80',
    companyVerified: true,
    type: 'job',
    title: 'AI Product Engineer',
    summary: 'Build high-throughput agentic workflows and human-in-the-loop interfaces for enterprise clients.',
    aboutRole: 'We are seeking an ambitious AI Product Engineer to lead development of our agentic execution pipelines. You will design, build, and deploy intelligent agents that streamline multi-department business processes.',
    whatYouWillDo: [
      'Develop end-to-end full-stack applications with Next.js, FastAPI, and Postgres',
      'Design robust LLM orchestration workflows with streaming outputs and fallback mechanisms',
      'Work directly with design and enterprise clients to rapidly iterate on feedback',
      'Maintain reliable telemetry, observability, and evaluation suites for production models',
    ],
    whatYouNeed: [
      'Proficiency in TypeScript, Python, and modern relational databases (PostgreSQL/Supabase)',
      'Experience with LangChain, LlamaIndex, or raw tool-calling LLM APIs',
      'Strong product sense and ability to think from the end-user perspective',
    ],
    skills: ['TypeScript', 'Next.js', 'Python', 'FastAPI', 'PostgreSQL', 'AI Agents'],
    pay: '$500–$800/mo (₹42,000–₹68,000/mo)',
    location: 'Remote - USA / India',
    isRemote: true,
    deadline: 'In 18 days',
    status: 'live',
    viewsCount: 890,
    applicantsCount: 12,
    createdAt: '2026-11-02T12:00:00Z',
  },
  {
    id: 'list-3',
    companyId: 'comp-3',
    companyName: 'Face Search AI',
    companyLogo: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100&auto=format&fit=crop&q=80',
    companyVerified: true,
    type: 'internship',
    title: 'Marketing & Growth Intern',
    summary: 'Drive viral product adoption, community engagement, and developer storytelling across technical channels.',
    aboutRole: 'Join our lean founding team to supercharge developer awareness. You will craft interactive demos, write engaging technical launch threads, and build relationships with computer vision developers.',
    whatYouWillDo: [
      'Create engaging short-form video breakdowns and visual walkthroughs of new AI features',
      'Engage with open-source developer communities on GitHub, X, and Reddit',
      'Analyze onboarding conversion funnels and test copy variations',
      'Organize monthly virtual demo days for our developer community',
    ],
    whatYouNeed: [
      'Genuine curiosity about AI products, developer tools, and tech storytelling',
      'Clear, punchy writing style with zero corporate jargon',
      'Basic familiarity with Figma or video editing tools is a bonus',
    ],
    skills: ['Content Marketing', 'Community Growth', 'Developer Advocacy', 'Social Media', 'Figma'],
    pay: '₹10k–₹20k/mo',
    location: 'Remote',
    isRemote: true,
    deadline: 'In 12 days',
    status: 'live',
    viewsCount: 640,
    applicantsCount: 24,
    createdAt: '2026-11-03T09:00:00Z',
  },
  {
    id: 'list-4',
    companyId: 'comp-1',
    companyName: 'Persist Media',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    companyVerified: true,
    type: 'job',
    title: 'Motion Graphic Designer',
    summary: 'Craft high-retention product animation, 3D UI micro-interactions, and visual storytelling assets.',
    aboutRole: 'We are looking for a versatile Motion Graphic Designer who can translate abstract tech concepts into sharp, buttery-smooth product trailers and educational visuals.',
    whatYouWillDo: [
      'Produce sleek UI product motion clips and feature launch teasers',
      'Collaborate with product designers to specify CSS and Lottie micro-interactions',
      'Create high-fidelity promotional media for social platforms',
    ],
    whatYouNeed: [
      'Portfolio demonstrating strong typography, pacing, and modern aesthetic',
      'Mastery of After Effects, Premiere, and Figma',
    ],
    skills: ['Motion Graphics', 'After Effects', 'Figma', 'UI Animation', 'Video Editing'],
    pay: '$300–$500/mo (₹25,000–₹42,000/mo)',
    location: 'Remote - USA / India',
    isRemote: true,
    deadline: 'In 21 days',
    status: 'live',
    viewsCount: 430,
    applicantsCount: 9,
    createdAt: '2026-11-01T15:00:00Z',
  },
  {
    id: 'list-5',
    companyId: 'comp-1',
    companyName: 'Persist Ventures',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    companyVerified: true,
    type: 'job',
    title: 'Full-Stack Engineer (Next.js & Supabase)',
    summary: 'Own core product architecture, realtime collaboration blocks, and developer APIs.',
    aboutRole: 'Build the foundational infrastructure powering our rapid startup incubation platform. High autonomy and direct equity incentives.',
    whatYouWillDo: [
      'Build responsive frontend interfaces with Next.js 15, Tailwind, and React Server Components',
      'Architect Supabase tables, row-level security policies, and realtime broadcast channels',
      'Optimize performance, SEO, and lighthouse scores across our public portals',
    ],
    whatYouNeed: [
      'Deep fluency with TypeScript, React, and PostgreSQL schema design',
      'Proven track record of shipping end-to-end applications',
    ],
    skills: ['Next.js', 'React', 'TypeScript', 'Supabase', 'PostgreSQL', 'Tailwind CSS'],
    pay: '₹12L - ₹18L/yr',
    location: 'Bengaluru / Hybrid',
    isRemote: true,
    deadline: 'In 25 days',
    status: 'live',
    viewsCount: 1120,
    applicantsCount: 16,
    createdAt: '2026-10-28T11:00:00Z',
  },
  {
    id: 'list-6',
    companyId: 'comp-2',
    companyName: 'Corpvance',
    companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80',
    companyVerified: true,
    type: 'challenge',
    title: 'Autonomous Document Intelligence Challenge',
    summary: 'Build a zero-shot financial report analyzer that extracts balance sheet anomalies into structured JSON.',
    aboutRole: 'Enterprise teams spend hours manually parsing unstructured 10-K filings and vendor invoices. Build a resilient web application that accepts multi-page financial PDFs, performs verifiable data extraction with citations, and highlights discrepancies.',
    whatYouWillDo: [
      'Build an interactive document viewer with synchronized table highlight overlays',
      'Integrate OCR/multimodal LLMs with schema enforcement (Zod/Pydantic)',
      'Provide CSV/JSON export and accuracy confidence scores per extracted field',
    ],
    whatYouNeed: [
      'Strong algorithmic foundation and hands-on experience with document parsing',
      'Demonstrated experience building clean, intuitive data interfaces',
    ],
    skills: ['Document AI', 'Python', 'Next.js', 'TypeScript', 'Fintech', 'OCR'],
    pay: '$500 cash prize',
    location: 'Remote',
    isRemote: true,
    deadline: 'Dec 15, 12:00 AM',
    status: 'live',
    challengeBrief: 'Design and deploy an intelligent web tool capable of parsing PDF invoices and quarterly financial statements, verifying checksums, and flagging risk points automatically.',
    deliverables: [
      'Public GitHub repository with setup instructions',
      'Live deployment with at least 3 sample documents pre-loaded',
      'Video walkthrough demonstrating anomaly detection',
    ],
    scoringChecklist: [
      { id: 'sc-201', item: 'Extraction Accuracy - Correctly identifies tabular numerical data without drift', points: 35 },
      { id: 'sc-202', item: 'Interactive Viewer - Highlights exact source bounding boxes when field is clicked', points: 30 },
      { id: 'sc-203', item: 'Code Quality & Tests - Modular parser with automated unit tests', points: 20 },
      { id: 'sc-204', item: 'User Experience - Fast, responsive, clean error states', points: 15 },
    ],
    maxAttempts: 4,
    prize: '$500',
    perks: ['Fast-track interview for Founding Engineer role', 'Full Corpvance Pro API access'],
    viewsCount: 780,
    applicantsCount: 8,
    createdAt: '2026-11-02T16:00:00Z',
  },
];

const initialApplications: Application[] = [
  {
    id: 'app-1',
    listingId: 'list-1',
    candidateId: 'user-cand-1',
    candidateName: 'Vamsi Vardhan Mukku',
    candidateHeadline: 'Product & Data Analyst specializing in fintech analytics and AI-driven automation',
    candidateLocation: 'Bengaluru, India',
    candidateSkills: ['Product Requirements Document Writing', 'SQL', 'Python', 'Power BI', 'Supabase', 'REST APIs'],
    candidateAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'assignment_pending',
    appliedAt: '2026-11-03T14:20:00Z',
    aiSummary: 'Vamsi Vardhan Mukku demonstrates strong alignment for Build the Operating System for Fanbases. Their background includes verified experience in Product Requirements, SQL, Python, and Supabase. Connected GitHub repository shows working Next.js and automation pipelines.',
    aiMatch: 'strong',
    aiStrengths: [
      { point: 'Hands-on skill match in Python, Supabase, and REST APIs', evidence: 'Verified skills list and connected repositories.' },
      { point: 'Direct code proof available', evidence: 'Connected GitHub profile with codebase: fanbase-operating-system.' },
    ],
    aiGaps: [
      { point: 'Production scale verification', evidence: 'Team should verify influencer outreach results during evaluation.' },
    ],
    totalScore: 85,
  },
  {
    id: 'app-2',
    listingId: 'list-1',
    candidateId: 'user-cand-2',
    candidateName: 'Rahul Nair',
    candidateHeadline: 'Frontend Engineer | React, TypeScript & Web3 Enthusiast',
    candidateLocation: 'Kochi, India',
    candidateSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'GraphQL'],
    candidateAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'shortlisted',
    appliedAt: '2026-11-02T11:15:00Z',
    aiSummary: 'Rahul shows high frontend proficiency with Next.js and TypeScript. Submitted working prototype with responsive mobile UI.',
    aiMatch: 'strong',
    aiStrengths: [
      { point: 'Pixel-perfect mobile UI execution', evidence: 'Clean Tailwind CSS and responsive design.' },
    ],
    aiGaps: [
      { point: 'Limited backend integration', evidence: 'Relies on local state rather than Supabase backend.' },
    ],
    totalScore: 78,
  },
  {
    id: 'app-3',
    listingId: 'list-2',
    candidateId: 'user-cand-3',
    candidateName: 'Priya Sharma',
    candidateHeadline: 'AI Engineer | NLP & LLM Orchestration Specialist',
    candidateLocation: 'Delhi, India',
    candidateSkills: ['Python', 'FastAPI', 'LangChain', 'PostgreSQL', 'Docker'],
    candidateAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'shortlisted',
    appliedAt: '2026-11-03T09:30:00Z',
    aiSummary: 'Priya has direct experience building agent workflows and tool-calling services in production. Excellent match for Corpvance.',
    aiMatch: 'strong',
    totalScore: 92,
  },
  {
    id: 'app-4',
    listingId: 'list-3',
    candidateId: 'user-cand-4',
    candidateName: 'Ananya Sen',
    candidateHeadline: 'Growth Marketer & Technical Writer',
    candidateLocation: 'Kolkata, India',
    candidateSkills: ['Content Marketing', 'Community Growth', 'Figma', 'SEO'],
    candidateAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    status: 'new',
    appliedAt: '2026-11-04T08:45:00Z',
    aiSummary: 'Ananya has created popular technical blog posts and community initiatives. Solid candidate for Face Search AI.',
    aiMatch: 'possible',
    totalScore: 70,
  },
];

const initialCampfireRooms: CampfireRoom[] = [
  {
    id: 'room-1',
    listingId: 'list-1',
    listingTitle: 'Build the Operating System for Fanbases',
    companyName: 'Persist Ventures',
    companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    isClosed: false,
    memberCount: 19,
    unreadCount: 3,
  },
  {
    id: 'room-2',
    listingId: 'list-2',
    listingTitle: 'AI Product Engineer',
    companyName: 'Corpvance',
    companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80',
    isClosed: false,
    memberCount: 13,
    unreadCount: 0,
  },
  {
    id: 'room-3',
    listingId: 'list-3',
    listingTitle: 'Marketing & Growth Intern',
    companyName: 'Face Search AI',
    companyLogo: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=100&auto=format&fit=crop&q=80',
    isClosed: false,
    memberCount: 25,
    unreadCount: 1,
  },
];

const initialMessages: CampfireMessage[] = [
  {
    id: 'msg-1',
    roomId: 'room-1',
    listingId: 'list-1',
    userId: 'user-comp-1',
    userName: 'Persist Team',
    userRole: 'company',
    isHost: true,
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    body: '🔥 Welcome to the Fanbase OS challenge! We are excited to see your builds. You have up to 4 submission attempts before the Nov 30 deadline. Ask any technical questions or pitch concepts directly here in the Campfire.',
    isPinned: true,
    createdAt: '2026-11-01T10:15:00Z',
  },
  {
    id: 'msg-2',
    roomId: 'room-1',
    listingId: 'list-1',
    userId: 'user-cand-2',
    userName: 'Rahul Nair',
    userRole: 'candidate',
    isHost: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    body: 'Quick question on the scoring checklist: is the creator verification bonus mandatory for the first submission version?',
    isPinned: false,
    createdAt: '2026-11-02T14:30:00Z',
  },
  {
    id: 'msg-3',
    roomId: 'room-1',
    listingId: 'list-1',
    userId: 'user-comp-1',
    userName: 'Persist Team',
    userRole: 'company',
    isHost: true,
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    body: 'Not mandatory for v1! You can submit your prototype MVP first to get initial feedback, then test with creators for your subsequent iterations.',
    isPinned: false,
    createdAt: '2026-11-02T14:45:00Z',
  },
  {
    id: 'msg-4',
    roomId: 'room-1',
    listingId: 'list-1',
    userId: 'user-cand-1',
    userName: 'Vamsi Vardhan Mukku',
    userRole: 'candidate',
    isHost: false,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    body: 'Working on the automated opportunity triage pipeline now. Looking forward to sharing version 1!',
    isPinned: false,
    createdAt: '2026-11-03T16:00:00Z',
  },
];

const HireRoomStoreContext = createContext<HireRoomStoreContextType | null>(null);

export function HireRoomProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'user-cand-1',
    email: 'vamsi@hireroom.dev',
    name: 'Vamsi Vardhan Mukku',
    role: 'candidate',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  });

  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile>(defaultCandidateProfile);
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [campfireRooms, setCampfireRooms] = useState<CampfireRoom[]>(initialCampfireRooms);
  const [messages, setMessages] = useState<CampfireMessage[]>(initialMessages);

  // Switch role between Candidate, Company, and Admin seamlessly for evaluation
  const switchRole = (role: UserRole) => {
    if (role === 'company') {
      setCurrentUser({
        id: 'user-comp-1',
        email: 'founder@persist.ventures',
        name: 'Persist Ventures Team',
        role: 'company',
        companyId: 'comp-1',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      });
    } else if (role === 'admin') {
      setCurrentUser({
        id: 'user-admin',
        email: 'admin@hireroom.dev',
        name: 'HireRoom Admin',
        role: 'admin',
      });
    } else {
      setCurrentUser({
        id: 'user-cand-1',
        email: 'vamsi@hireroom.dev',
        name: candidateProfile.name || 'Vamsi Vardhan Mukku',
        role: 'candidate',
        avatar: candidateProfile.avatarUrl,
      });
    }
  };

  const updateCandidateProfile = (updates: Partial<CandidateProfile>) => {
    setCandidateProfile(prev => ({
      ...prev,
      ...updates,
    }));
  };

  const addCompany = (companyData: Omit<Company, 'id' | 'createdDaysAgo'>): Company => {
    const newCompany: Company = {
      ...companyData,
      id: `comp-${Date.now()}`,
      createdDaysAgo: 0,
    };
    setCompanies(prev => [newCompany, ...prev]);
    return newCompany;
  };

  const addListing = (listingData: Omit<Listing, 'id' | 'createdAt' | 'viewsCount' | 'applicantsCount'>): Listing => {
    const newId = `list-${Date.now()}`;
    const newListing: Listing = {
      ...listingData,
      id: newId,
      viewsCount: 1,
      applicantsCount: 0,
      createdAt: new Date().toISOString(),
    };
    setListings(prev => [newListing, ...prev]);

    // Automatically create a Campfire room for this listing!
    const newRoom: CampfireRoom = {
      id: `room-${Date.now()}`,
      listingId: newId,
      listingTitle: newListing.title,
      companyName: newListing.companyName,
      companyLogo: newListing.companyLogo,
      isClosed: false,
      memberCount: 1,
      unreadCount: 0,
    };
    setCampfireRooms(prev => [newRoom, ...prev]);

    // Add initial host greeting message in the new room
    const welcomeMsg: CampfireMessage = {
      id: `msg-${Date.now()}`,
      roomId: newRoom.id,
      listingId: newId,
      userId: currentUser.id,
      userName: newListing.companyName,
      userRole: 'company',
      isHost: true,
      avatar: newListing.companyLogo,
      body: `🔥 Welcome to the ${newListing.title} Campfire room! Feel free to ask questions about the role or requirements.`,
      isPinned: true,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, welcomeMsg]);

    return newListing;
  };

  const updateListing = (id: string, updates: Partial<Listing>) => {
    setListings(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));
  };

  const applyToListing = (listingId: string, screeningAnswers?: Record<string, string>): Application => {
    const targetListing = listings.find(l => l.id === listingId);
    if (!targetListing) throw new Error('Listing not found');

    // Run AI Prompt B for instant applicant scoring
    const aiAnalysis = generateApplicantSummaryPromptB(targetListing, candidateProfile);

    const newApp: Application = {
      id: `app-${Date.now()}`,
      listingId,
      candidateId: candidateProfile.userId,
      candidateName: candidateProfile.name,
      candidateHeadline: candidateProfile.headline,
      candidateLocation: candidateProfile.location,
      candidateSkills: candidateProfile.skills,
      candidateAvatar: candidateProfile.avatarUrl,
      status: targetListing.type === 'challenge' ? 'assignment_pending' : 'new',
      screeningAnswers,
      appliedAt: new Date().toISOString(),
      aiSummary: aiAnalysis.summary,
      aiMatch: aiAnalysis.match,
      aiStrengths: aiAnalysis.strengths,
      aiGaps: aiAnalysis.gaps,
      totalScore: aiAnalysis.totalScore,
    };

    setApplications(prev => [newApp, ...prev]);

    // Increment applicantsCount on listing
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, applicantsCount: l.applicantsCount + 1 } : l));

    // Ensure candidate is added to the Campfire room
    setCampfireRooms(prev => prev.map(r => r.listingId === listingId ? { ...r, memberCount: r.memberCount + 1 } : r));

    return newApp;
  };

  const updateApplicationStatus = (id: string, status: Application['status']) => {
    setApplications(prev => prev.map(app => (app.id === id ? { ...app, status } : app)));
  };

  const addSubmission = (subData: Omit<Submission, 'id' | 'submittedAt' | 'totalScore'>): Submission => {
    const targetListing = listings.find(l => l.id === subData.listingId);
    let totalScore = 85;

    if (targetListing?.scoringChecklist) {
      totalScore = targetListing.scoringChecklist.reduce((acc, item) => acc + Math.round(item.points * 0.9), 0);
    }

    const newSub: Submission = {
      ...subData,
      id: `sub-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      totalScore,
    };

    setSubmissions(prev => [newSub, ...prev]);

    // Update the application totalScore and reference
    setApplications(prev =>
      prev.map(app =>
        app.id === subData.applicationId
          ? { ...app, submissionId: newSub.id, totalScore, status: 'shortlisted' }
          : app
      )
    );

    return newSub;
  };

  const sendMessage = (roomId: string, body: string, isPinned = false) => {
    const targetRoom = campfireRooms.find(r => r.id === roomId);
    const newMsg: CampfireMessage = {
      id: `msg-${Date.now()}`,
      roomId,
      listingId: targetRoom?.listingId || '',
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      isHost: currentUser.role === 'company' || currentUser.role === 'admin',
      avatar: currentUser.avatar,
      body,
      isPinned,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);
  };

  // Candidate Dashboard Stats
  const candidateStats = {
    totalApplications: applications.filter(a => a.candidateId === candidateProfile.userId).length,
    inReview: applications.filter(a => a.candidateId === candidateProfile.userId && (a.status === 'new' || a.status === 'assignment_pending')).length,
    shortlisted: applications.filter(a => a.candidateId === candidateProfile.userId && a.status === 'shortlisted').length,
    accepted: applications.filter(a => a.candidateId === candidateProfile.userId && a.status === 'hired').length,
  };

  return (
    <HireRoomStoreContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        candidateProfile,
        updateCandidateProfile,
        companies,
        addCompany,
        listings,
        addListing,
        updateListing,
        applications,
        applyToListing,
        updateApplicationStatus,
        submissions,
        addSubmission,
        campfireRooms,
        messages,
        sendMessage,
        candidateStats,
      }}
    >
      {children}
    </HireRoomStoreContext.Provider>
  );
}

export function useHireRoomStore() {
  const context = useContext(HireRoomStoreContext);
  if (!context) {
    throw new Error('useHireRoomStore must be used within a HireRoomProvider');
  }
  return context;
}
