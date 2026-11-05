import { renderEmail } from '../src/lib/email/templates';
import { EmailEvent } from '../src/lib/email/types';

const samplePayloads: Record<EmailEvent, any> = {
  welcome_candidate: { recipient: 'arjun@example.com', candidateName: 'Arjun' },
  welcome_company: { recipient: 'founder@kavach.in', companyName: 'Kavach Systems (Demo)' },
  signin_link: { recipient: 'arjun@example.com', magicLink: 'http://localhost:3000/auth/callback?code=492815', otpCode: '492815' },
  company_submitted_for_review: { recipient: 'admin@hireroom.com', companyName: 'Zephyr Health (Demo)', companyWebsite: 'https://zephyrhealth.in', listingTitle: 'Staff Bio-AI Engineer', adminReviewUrl: 'http://localhost:3000/admin' },
  listing_decision: { recipient: 'founder@zephyrhealth.in', companyName: 'Zephyr Health (Demo)', listingTitle: 'Staff Bio-AI Engineer', approved: true, listingUrl: 'http://localhost:3000/roles' },
  application_received: { recipient: 'neha@example.com', candidateName: 'Neha', listingTitle: 'Senior Frontend Engineer', companyName: 'Kavach Systems (Demo)', listingId: 'list-1', campfireUrl: 'http://localhost:3000/campfire?listingId=list-1' },
  new_applicants_digest: { recipient: 'team@kavach.in', companyName: 'Kavach Systems (Demo)', applicantCount: 4, topMatches: [{ name: 'Vikram Patel', title: 'Fullstack Lead', matchScore: 94 }], inboxUrl: 'http://localhost:3000/company/dashboard' },
  challenge_entered: { recipient: 'vikram@example.com', candidateName: 'Vikram', challengeTitle: 'Autonomous Defense Network Agent', companyName: 'Kavach Systems (Demo)', deadline: '18 Nov 2026', attemptsAllowed: 3, challengeUrl: 'http://localhost:3000/challenges/c1', campfireUrl: 'http://localhost:3000/campfire?listingId=c1' },
  submission_received: { recipient: 'vikram@example.com', candidateName: 'Vikram', challengeTitle: 'Autonomous Defense Network Agent', companyName: 'Kavach Systems (Demo)', versionNumber: 1, attemptsRemaining: 2, deadline: '18 Nov 2026', submissionUrl: 'http://localhost:3000/challenges/c1/assignment' },
  new_submission_company: { recipient: 'team@kavach.in', companyName: 'Kavach Systems (Demo)', challengeTitle: 'Autonomous Defense Network Agent', candidateName: 'Vikram Patel', versionNumber: 1, reviewUrl: 'http://localhost:3000/company/dashboard' },
  candidate_shortlisted: { recipient: 'vikram@example.com', candidateName: 'Vikram', listingTitle: 'Autonomous Defense Network Agent', companyName: 'Kavach Systems (Demo)', dashboardUrl: 'http://localhost:3000/dashboard' },
  candidate_hired: { recipient: 'vikram@example.com', candidateName: 'Vikram', listingTitle: 'Autonomous Defense Network Agent', companyName: 'Kavach Systems (Demo)', dashboardUrl: 'http://localhost:3000/dashboard', isCompanyConfirmation: false },
  candidate_not_selected: { recipient: 'cand@example.com', candidateName: 'Rahul', listingTitle: 'Senior Backend Engineer', companyName: 'Apex Commerce (Demo)', rolesUrl: 'http://localhost:3000/roles' },
  challenge_deadline_reminder: { recipient: 'vikram@example.com', candidateName: 'Vikram', challengeTitle: 'Autonomous Defense Network Agent', companyName: 'Kavach Systems (Demo)', attemptsRemaining: 1, deadline: 'Tomorrow at 11:59 PM IST', submissionUrl: 'http://localhost:3000/challenges/c1/assignment' },
  listing_closed_summary: { recipient: 'team@kavach.in', companyName: 'Kavach Systems (Demo)', listingTitle: 'Autonomous Defense Network Agent', applicantCount: 38, shortlistedCount: 2, dashboardUrl: 'http://localhost:3000/company/dashboard' },
  campfire_announcement: { recipient: 'vikram@example.com', memberName: 'Vikram', listingTitle: 'Autonomous Defense Network Agent', hostName: 'Dr. Ramesh (CTO)', announcementSnippet: 'Rubric clarification: real-world benchmark metrics carry 30 points.', campfireUrl: 'http://localhost:3000/campfire?listingId=c1' }
};

async function run() {
  const events = Object.keys(samplePayloads) as EmailEvent[];
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const { subject, text } = await renderEmail(ev, samplePayloads[ev]);
    const cleanLines = text.split('\n').map(l => l.trim()).filter(Boolean);
    console.log(`[Event #${i + 1}: ${ev}]`);
    console.log(`To: ${samplePayloads[ev].recipient}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body Snippet: ${cleanLines.slice(1, 4).join(' ')}`);
    console.log('----------------------------------------------------');
  }
}

run();
