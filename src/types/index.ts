export type UserRole = 'candidate' | 'company' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  companyId?: string;
}

export interface CandidateProfile {
  userId: string;
  name: string;
  headline: string;
  location: string;
  phone: string;
  experience: string;
  availability: string;
  about: string;
  skills: string[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  resumeFileName?: string;
  resumeFileSize?: string;
  githubConnected: boolean;
  githubUsername?: string;
  githubUrl?: string;
  githubRepos?: {
    id: string;
    name: string;
    description: string;
    stars: number;
    language: string;
    url: string;
    updatedAt: string;
  }[];
  portfolioUrl?: string;
  linkedinUrl?: string;
  targetRoles?: string[];
  referralSource?: string;
  avatarUrl?: string;
}

export interface Company {
  id: string;
  name: string;
  website: string;
  logo: string;
  oneLiner: string;
  city: string;
  isRemote: boolean;
  size: '1-10' | '11-50' | '51-200' | '200+';
  verified: boolean;
  status: 'pending' | 'active' | 'suspended';
  createdDaysAgo: number;
}

export type ListingType = 'job' | 'internship' | 'challenge';
export type ListingStatus = 'draft' | 'pending_review' | 'live' | 'closed';

export interface ScoringRubricItem {
  id: string;
  item: string;
  points: number;
}

export interface Listing {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  companyVerified: boolean;
  type: ListingType;
  title: string;
  summary: string;
  aboutRole: string;
  whatYouWillDo: string[];
  whatYouNeed: string[];
  skills: string[];
  pay: string; // e.g. "₹12L - ₹18L/yr", "₹25k - ₹40k/mo", "$250 + 10% equity"
  location: string;
  isRemote: boolean;
  deadline: string;
  status: ListingStatus;
  
  // Challenge specifics
  challengeBrief?: string;
  deliverables?: string[];
  scoringChecklist?: ScoringRubricItem[];
  maxAttempts?: number;
  prize?: string;
  equity?: string;
  perks?: string[];
  videoUrl?: string;
  viewsCount: number;
  applicantsCount: number;
  createdAt: string;
}

export type ApplicationStatus = 'new' | 'assignment_pending' | 'shortlisted' | 'hired' | 'rejected';
export type AIMatchLevel = 'strong' | 'possible' | 'weak';

export interface Application {
  id: string;
  listingId: string;
  candidateId: string;
  candidateName: string;
  candidateHeadline: string;
  candidateLocation: string;
  candidateSkills: string[];
  candidateAvatar?: string;
  status: ApplicationStatus;
  screeningAnswers?: Record<string, string>;
  appliedAt: string;
  
  // AI summary using Prompt B
  aiSummary?: string;
  aiMatch?: AIMatchLevel;
  aiStrengths?: { point: string; evidence: string }[];
  aiGaps?: { point: string; evidence: string }[];
  
  // Current submission reference if challenge
  submissionId?: string;
  totalScore?: number;
}

export interface Submission {
  id: string;
  applicationId: string;
  listingId: string;
  candidateId: string;
  version: number;
  repoUrl?: string;
  repoName?: string;
  demoUrl?: string;
  videoUrl?: string;
  notes?: string;
  files?: string[];
  submittedAt: string;
  checklistScores?: {
    itemId: string;
    item: string;
    score: number;
    maxPoints: number;
    reason: string;
  }[];
  totalScore: number;
}

export interface CampfireMessage {
  id: string;
  roomId: string;
  listingId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  isHost: boolean;
  avatar?: string;
  body: string;
  isPinned: boolean;
  createdAt: string;
}

export interface CampfireRoom {
  id: string;
  listingId: string;
  listingTitle: string;
  companyName: string;
  companyLogo: string;
  isClosed: boolean;
  memberCount: number;
  unreadCount?: number;
}
