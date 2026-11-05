export type EmailEvent =
  | 'welcome_candidate'
  | 'welcome_company'
  | 'signin_link'
  | 'company_submitted_for_review'
  | 'listing_decision'
  | 'application_received'
  | 'new_applicants_digest'
  | 'challenge_entered'
  | 'submission_received'
  | 'new_submission_company'
  | 'candidate_shortlisted'
  | 'candidate_hired'
  | 'candidate_not_selected'
  | 'challenge_deadline_reminder'
  | 'listing_closed_summary'
  | 'campfire_announcement';

export interface EmailPayloadMap {
  welcome_candidate: {
    recipient: string;
    candidateName: string;
    onboardingUrl?: string;
  };
  welcome_company: {
    recipient: string;
    companyName: string;
    postUrl?: string;
  };
  signin_link: {
    recipient: string;
    magicLink: string;
    otpCode: string;
    expiresInMinutes?: number;
  };
  company_submitted_for_review: {
    recipient: string;
    companyName: string;
    companyWebsite: string;
    listingTitle: string;
    adminReviewUrl: string;
  };
  listing_decision: {
    recipient: string;
    companyName: string;
    listingTitle: string;
    approved: boolean;
    feedback?: string;
    listingUrl?: string;
  };
  application_received: {
    recipient: string;
    candidateName: string;
    listingTitle: string;
    companyName: string;
    listingId: string;
    campfireUrl: string;
  };
  new_applicants_digest: {
    recipient: string;
    companyName: string;
    applicantCount: number;
    topMatches: Array<{ name: string; title: string; matchScore?: number }>;
    inboxUrl: string;
  };
  challenge_entered: {
    recipient: string;
    candidateName: string;
    challengeTitle: string;
    companyName: string;
    deadline: string;
    attemptsAllowed: number;
    challengeUrl: string;
    campfireUrl: string;
  };
  submission_received: {
    recipient: string;
    candidateName: string;
    challengeTitle: string;
    companyName: string;
    versionNumber: number;
    attemptsRemaining: number;
    deadline: string;
    submissionUrl: string;
  };
  new_submission_company: {
    recipient: string;
    companyName: string;
    challengeTitle: string;
    candidateName: string;
    versionNumber: number;
    reviewUrl: string;
  };
  candidate_shortlisted: {
    recipient: string;
    candidateName: string;
    listingTitle: string;
    companyName: string;
    dashboardUrl: string;
  };
  candidate_hired: {
    recipient: string;
    candidateName: string;
    listingTitle: string;
    companyName: string;
    dashboardUrl: string;
    isCompanyConfirmation?: boolean;
  };
  candidate_not_selected: {
    recipient: string;
    candidateName: string;
    listingTitle: string;
    companyName: string;
    rolesUrl: string;
  };
  challenge_deadline_reminder: {
    recipient: string;
    candidateName: string;
    challengeTitle: string;
    companyName: string;
    attemptsRemaining: number;
    deadline: string;
    submissionUrl: string;
  };
  listing_closed_summary: {
    recipient: string;
    companyName: string;
    listingTitle: string;
    applicantCount: number;
    shortlistedCount: number;
    dashboardUrl: string;
  };
  campfire_announcement: {
    recipient: string;
    memberName: string;
    listingTitle: string;
    hostName: string;
    announcementSnippet: string;
    campfireUrl: string;
  };
}

export interface OutboxEmailRecord<T extends EmailEvent = EmailEvent> {
  id: string;
  event: T;
  recipient: string;
  subject: string;
  payload: EmailPayloadMap[T];
  deduplication_key: string;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  attempts: number;
  max_attempts: number;
  last_attempt_at: string | null;
  last_error: string | null;
  resend_id: string | null;
  created_at: string;
  sent_at: string | null;
}

export interface InAppNotification {
  id: string;
  userId: string;
  event: EmailEvent;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface EmailSuppression {
  email: string;
  reason: 'bounce' | 'complaint' | 'unsubscribe';
  createdAt: string;
}

export interface EmailPreferences {
  email: string;
  digests: boolean;
  announcements: boolean;
  reminders: boolean;
  updatedAt: string;
}

// Events that cannot be unsubscribed from (critical account, auth and status changes)
export const ESSENTIAL_EMAIL_EVENTS: ReadonlySet<EmailEvent> = new Set([
  'welcome_candidate',
  'welcome_company',
  'signin_link',
  'company_submitted_for_review',
  'listing_decision',
  'application_received',
  'challenge_entered',
  'submission_received',
  'new_submission_company',
  'candidate_shortlisted',
  'candidate_hired',
  'candidate_not_selected',
  'listing_closed_summary',
]);

export function isEssentialEmail(event: EmailEvent): boolean {
  return ESSENTIAL_EMAIL_EVENTS.has(event);
}
