import React from 'react';
import { render } from '@react-email/render';
import { Text, Link, Button, Section, Hr } from '@react-email/components';
import { EmailLayout, buttonPrimaryStyle } from '../layout';
import { EmailEvent, EmailPayloadMap, isEssentialEmail } from '../types';

export function getEmailSubject<T extends EmailEvent>(event: T, payload: EmailPayloadMap[T]): string {
  switch (event) {
    case 'welcome_candidate':
      return 'Welcome to HireRoom — Complete your profile';
    case 'welcome_company':
      return 'Welcome to HireRoom — Post your first listing in under 2 minutes';
    case 'signin_link':
      return 'Your HireRoom sign-in link and code';
    case 'company_submitted_for_review':
      return `Review required: ${(payload as EmailPayloadMap['company_submitted_for_review']).companyName} submitted ${(payload as EmailPayloadMap['company_submitted_for_review']).listingTitle}`;
    case 'listing_decision':
      return (payload as EmailPayloadMap['listing_decision']).approved
        ? `Your listing ${(payload as EmailPayloadMap['listing_decision']).listingTitle} is approved!`
        : `Changes requested for ${(payload as EmailPayloadMap['listing_decision']).listingTitle}`;
    case 'application_received':
      return `Application received: ${(payload as EmailPayloadMap['application_received']).listingTitle} at ${(payload as EmailPayloadMap['application_received']).companyName}`;
    case 'new_applicants_digest':
      return `${(payload as EmailPayloadMap['new_applicants_digest']).applicantCount} new applicant(s) for your HireRoom listings`;
    case 'challenge_entered':
      return `You entered ${(payload as EmailPayloadMap['challenge_entered']).challengeTitle} — here is what to know`;
    case 'submission_received':
      return `Submission received: ${(payload as EmailPayloadMap['submission_received']).challengeTitle} (v${(payload as EmailPayloadMap['submission_received']).versionNumber})`;
    case 'new_submission_company':
      return `New submission for ${(payload as EmailPayloadMap['new_submission_company']).challengeTitle} from ${(payload as EmailPayloadMap['new_submission_company']).candidateName}`;
    case 'candidate_shortlisted':
      return `Great news: You've been shortlisted for ${(payload as EmailPayloadMap['candidate_shortlisted']).listingTitle}!`;
    case 'candidate_hired':
      return (payload as EmailPayloadMap['candidate_hired']).isCompanyConfirmation
        ? `Offer confirmed: ${(payload as EmailPayloadMap['candidate_hired']).candidateName} hired for ${(payload as EmailPayloadMap['candidate_hired']).listingTitle}`
        : `Congratulations! You're hired for ${(payload as EmailPayloadMap['candidate_hired']).listingTitle} at ${(payload as EmailPayloadMap['candidate_hired']).companyName}`;
    case 'candidate_not_selected':
      return `Update on your application for ${(payload as EmailPayloadMap['candidate_not_selected']).listingTitle} at ${(payload as EmailPayloadMap['candidate_not_selected']).companyName}`;
    case 'challenge_deadline_reminder':
      return `24 hours left: Submit your entry for ${(payload as EmailPayloadMap['challenge_deadline_reminder']).challengeTitle}`;
    case 'listing_closed_summary':
      return `Listing closed: ${(payload as EmailPayloadMap['listing_closed_summary']).listingTitle} summary`;
    case 'campfire_announcement':
      return `New announcement in ${(payload as EmailPayloadMap['campfire_announcement']).listingTitle} Campfire`;
    default:
      return 'Notification from HireRoom';
  }
}

export function renderEmailTemplate<T extends EmailEvent>(
  event: T,
  payload: EmailPayloadMap[T]
): React.ReactElement {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hireroom.com';
  const unsubscribeUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(payload.recipient)}`;
  const isEssential = isEssentialEmail(event);

  switch (event) {
    case 'welcome_candidate': {
      const p = payload as EmailPayloadMap['welcome_candidate'];
      return (
        <EmailLayout
          previewText="Complete your HireRoom profile to apply with proof."
          headline={
            <>
              Welcome to <span style={{ color: '#E11D48', fontStyle: 'italic' }}>HireRoom</span>
            </>
          }
          unsubscribeUrl={unsubscribeUrl}
          isEssential={isEssential}
        >
          <Text style={{ marginBottom: '16px' }}>Hi {p.candidateName},</Text>
          <Text style={{ marginBottom: '16px' }}>
            Welcome to HireRoom. Your first step is to upload or finish your profile. On HireRoom,
            you apply with proof, not just bullet points on paper.
          </Text>
          <Text style={{ marginBottom: '24px' }}>
            There are no outside forms, no broken links, and zero spreadsheets. Everything happens
            inside your listing rooms.
          </Text>
          <Section style={{ textAlign: 'center', margin: '28px 0' }}>
            <Button href={p.onboardingUrl || `${siteUrl}/onboarding/candidate`} style={buttonPrimaryStyle}>
              Complete Your Profile
            </Button>
          </Section>
        </EmailLayout>
      );
    }

    case 'welcome_company': {
      const p = payload as EmailPayloadMap['welcome_company'];
      return (
        <EmailLayout
          previewText="Post your first job or challenge on HireRoom in under 2 minutes."
          headline={
            <>
              Welcome to <span style={{ color: '#E11D48', fontStyle: 'italic' }}>HireRoom</span>
            </>
          }
          unsubscribeUrl={unsubscribeUrl}
          isEssential={isEssential}
        >
          <Text style={{ marginBottom: '16px' }}>Hi {p.companyName} Team,</Text>
          <Text style={{ marginBottom: '16px' }}>
            HireRoom lets you post a job, an internship, or an open challenge in under two minutes
            with a clean 4-question flow.
          </Text>
          <Text style={{ marginBottom: '24px' }}>
            Candidates apply with verified profiles and real work proof. No pasted links, no external
            spreadsheets, and no email ping-pong.
          </Text>
          <Section style={{ textAlign: 'center', margin: '28px 0' }}>
            <Button href={p.postUrl || `${siteUrl}/company/post`} style={buttonPrimaryStyle}>
              Post Your First Listing
            </Button>
          </Section>
        </EmailLayout>
      );
    }

    case 'signin_link': {
      const p = payload as EmailPayloadMap['signin_link'];
      return (
        <EmailLayout
          previewText="Your one-time sign-in link and verification code."
          headline={
            <>
              Sign in to <span style={{ color: '#E11D48', fontStyle: 'italic' }}>HireRoom</span>
            </>
          }
          unsubscribeUrl={unsubscribeUrl}
          isEssential={isEssential}
        >
          <Text style={{ marginBottom: '16px' }}>
            Use the button below or enter the 6-digit verification code to sign in to your account.
          </Text>
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <div
              style={{
                backgroundColor: '#FFF1F2',
                border: '1px solid #E6DFE4',
                borderRadius: '12px',
                padding: '16px 24px',
                display: 'inline-block',
                fontFamily: 'monospace',
                fontSize: '28px',
                letterSpacing: '6px',
                fontWeight: 'bold',
                color: '#1B1420',
              }}
            >
              {p.otpCode}
            </div>
          </Section>
          <Section style={{ textAlign: 'center', margin: '20px 0' }}>
            <Button href={p.magicLink} style={buttonPrimaryStyle}>
              Sign In with One Click
            </Button>
          </Section>
          <Text style={{ fontSize: '13px', color: '#5C5464', marginTop: '20px' }}>
            This link and code expire in {p.expiresInMinutes || 10} minutes. If you did not request
            this, you can safely ignore this email.
          </Text>
        </EmailLayout>
      );
    }

    case 'company_submitted_for_review': {
      const p = payload as EmailPayloadMap['company_submitted_for_review'];
      return (
        <EmailLayout
          previewText={`Review required: ${p.companyName} submitted ${p.listingTitle}`}
          headline={
            <>
              Listing Submitted for <span style={{ color: '#E11D48', fontStyle: 'italic' }}>Review</span>
            </>
          }
          unsubscribeUrl={unsubscribeUrl}
          isEssential={isEssential}
        >
          <Text style={{ marginBottom: '16px' }}>HireRoom Admin Team,</Text>
          <Text style={{ marginBottom: '12px' }}>
            A new listing has been submitted and requires admin review:
          </Text>
          <ul style={{ color: '#1B1420', paddingLeft: '20px', marginBottom: '20px' }}>
            <li>
              <strong>Company:</strong> {p.companyName} ({p.companyWebsite})
            </li>
            <li>
              <strong>Listing:</strong> {p.listingTitle}
            </li>
          </ul>
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button href={p.adminReviewUrl} style={buttonPrimaryStyle}>
              Review in Admin Console
            </Button>
          </Section>
        </EmailLayout>
      );
    }

    case 'listing_decision': {
      const p = payload as EmailPayloadMap['listing_decision'];
      return (
        <EmailLayout
          previewText={
            p.approved
              ? `Your listing ${p.listingTitle} is now live.`
              : `Updates needed for ${p.listingTitle}.`
          }
          headline={
            p.approved ? (
              <>
                Listing <span style={{ color: '#E11D48', fontStyle: 'italic' }}>Approved</span>
              </>
            ) : (
              <>
                Listing <span style={{ color: '#E11D48', fontStyle: 'italic' }}>Needs Changes</span>
              </>
            )
          }
          unsubscribeUrl={unsubscribeUrl}
          isEssential={isEssential}
        >
          <Text style={{ marginBottom: '16px' }}>Hi {p.companyName} Team,</Text>
          {p.approved ? (
            <>
              <Text style={{ marginBottom: '16px' }}>
                Good news! Your listing <strong>{p.listingTitle}</strong> has been approved and is
                now visible to candidates on HireRoom.
              </Text>
              <Section style={{ textAlign: 'center', margin: '24px 0' }}>
                <Button href={p.listingUrl || `${siteUrl}/roles`} style={buttonPrimaryStyle}>
                  View Live Listing
                </Button>
              </Section>
            </>
          ) : (
            <>
              <Text style={{ marginBottom: '16px' }}>
                Our team reviewed your listing <strong>{p.listingTitle}</strong> and noted a few items
                that need attention:
              </Text>
              <div
                style={{
                  backgroundColor: '#FFF1F2',
                  padding: '16px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  color: '#1B1420',
                }}
              >
                {p.feedback || 'Please ensure compensation and requirements are fully specified.'}
              </div>
              <Section style={{ textAlign: 'center', margin: '24px 0' }}>
                <Button href={p.listingUrl || `${siteUrl}/company/dashboard`} style={buttonPrimaryStyle}>
                  Update Listing
                </Button>
              </Section>
            </>
          )}
        </EmailLayout>
      );
    }

    case 'application_received': {
      const p = payload as EmailPayloadMap['application_received'];
      return (
        <EmailLayout
          previewText={`Application confirmed for ${p.listingTitle} at ${p.companyName}.`}
          headline={
            <>
              Application <span style={{ color: '#E11D48', fontStyle: 'italic' }}>Received</span>
            </>
          }
          unsubscribeUrl={unsubscribeUrl}
          isEssential={isEssential}
        >
          <Text style={{ marginBottom: '16px' }}>Hi {p.candidateName},</Text>
          <Text style={{ marginBottom: '16px' }}>
            We received your application for <strong>{p.listingTitle}</strong> at{' '}
            <strong>{p.companyName}</strong>.
          </Text>
          <Text style={{ marginBottom: '16px' }}>
            What happens next: the hiring team reviews your verified profile directly. All decisions
            and communications happen inside HireRoom.
          </Text>
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button href={p.campfireUrl} style={buttonPrimaryStyle}>
              Enter Campfire Room
            </Button>
          </Section>
        </EmailLayout>
      );
    }

    case 'new_applicants_digest': {
      const p = payload as EmailPayloadMap['new_applicants_digest'];
      return (
        <EmailLayout
          previewText={`${p.applicantCount} new candidate(s) applied to your listings.`}
          headline={
            <>
              New Applicants <span style={{ color: '#E11D48', fontStyle: 'italic' }}>Digest</span>
            </>
          }
          unsubscribeUrl={unsubscribeUrl}
          isEssential={isEssential}
        >
          <Text style={{ marginBottom: '16px' }}>Hi {p.companyName} Team,</Text>
          <Text style={{ marginBottom: '16px' }}>
            You have received <strong>{p.applicantCount} new applicant(s)</strong> across your active
            listings today:
          </Text>
          <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
            {p.topMatches.map((m, idx) => (
              <li key={idx} style={{ marginBottom: '6px' }}>
                <strong>{m.name}</strong> — {m.title}{' '}
                {m.matchScore ? `(${m.matchScore}% match)` : ''}
              </li>
            ))}
          </ul>
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button href={p.inboxUrl} style={buttonPrimaryStyle}>
              Review Applicants in Inbox
            </Button>
          </Section>
        </EmailLayout>
      );
    }

    case 'challenge_entered': {
      const p = payload as EmailPayloadMap['challenge_entered'];
      return (
        <EmailLayout
          previewText={`You entered ${p.challengeTitle}.`}
          headline={
            <>
              Challenge <span style={{ color: '#E11D48', fontStyle: 'italic' }}>Entered</span>
            </>
          }
          unsubscribeUrl={unsubscribeUrl}
          isEssential={isEssential}
        >
          <Text style={{ marginBottom: '16px' }}>Hi {p.candidateName},</Text>
          <Text style={{ marginBottom: '16px' }}>
            You are officially entered into <strong>{p.challengeTitle}</strong> hosted by{' '}
            <strong>{p.companyName}</strong>.
          </Text>
          <div
            style={{
              backgroundColor: '#FAF8F9',
              border: '1px solid #E6DFE4',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>Deadline:</strong> {p.deadline}
            </p>
            <p style={{ margin: '0' }}>
              <strong>Attempts Allowed:</strong> {p.attemptsAllowed}
            </p>
          </div>
          <Text style={{ marginBottom: '24px' }}>
            Review the 100-point rubric and interact with other builders and mentors in the room:
          </Text>
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button href={p.campfireUrl} style={buttonPrimaryStyle}>
              Open Challenge &amp; Campfire
            </Button>
          </Section>
        </EmailLayout>
      );
    }

    case 'submission_received': {
      const p = payload as EmailPayloadMap['submission_received'];
      return (
        <EmailLayout
          previewText={`Submission v${p.versionNumber} recorded for ${p.challengeTitle}.`}
          headline={
            <>
              Submission <span style={{ color: '#E11D48', fontStyle: 'italic' }}>Received</span>
            </>
          }
          unsubscribeUrl={unsubscribeUrl}
          isEssential={isEssential}
        >
          <Text style={{ marginBottom: '16px' }}>Hi {p.candidateName},</Text>
          <Text style={{ marginBottom: '16px' }}>
            We have recorded your submission <strong>Version {p.versionNumber}</strong> for{' '}
            <strong>{p.challengeTitle}</strong>.
          </Text>
          <Text style={{ marginBottom: '16px' }}>
            <strong>Attempts remaining:</strong> {p.attemptsRemaining} •{' '}
            <strong>Deadline:</strong> {p.deadline}
          </Text>
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button href={p.submissionUrl} style={buttonPrimaryStyle}>
              View Your Submission
            </Button>
          </Section>
        </EmailLayout>
      );
    }

    case 'new_submission_company': {
      const p = payload as EmailPayloadMap['new_submission_company'];
      return (
        <EmailLayout
          previewText={`New submission from ${p.candidateName} for ${p.challengeTitle}.`}
          headline={
            <>
              New Challenge <span style={{ color: '#E11D48', fontStyle: 'italic' }}>Submission</span>
            </>
          }
          unsubscribeUrl={unsubscribeUrl}
          isEssential={isEssential}
        >
          <Text style={{ marginBottom: '16px' }}>Hi {p.companyName} Team,</Text>
          <Text style={{ marginBottom: '16px' }}>
            <strong>{p.candidateName}</strong> just submitted <strong>Version {p.versionNumber}</strong>{' '}
            for your challenge <strong>{p.challengeTitle}</strong>.
          </Text>
          <Text style={{ marginBottom: '24px' }}>
            You can evaluate the deliverables against your 100-point rubric in your inbox:
          </Text>
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button href={p.reviewUrl} style={buttonPrimaryStyle}>
              Review Submission
            </Button>
          </Section>
        </EmailLayout>
      );
    }

    case 'candidate_shortlisted': {
      const p = payload as EmailPayloadMap['candidate_shortlisted'];
      return (
        <EmailLayout
          previewText={`Great news! You have been shortlisted for ${p.listingTitle}.`}
          headline={
            <>
              You&apos;re <span style={{ color: '#E11D48', fontStyle: 'italic' }}>Shortlisted</span>!
            </>
          }
          unsubscribeUrl={unsubscribeUrl}
          isEssential={isEssential}
        >
          <Text style={{ marginBottom: '16px' }}>Hi {p.candidateName},</Text>
          <Text style={{ marginBottom: '16px' }}>
            Exciting news! <strong>{p.companyName}</strong> has reviewed your proof and shortlisted
            you for <strong>{p.listingTitle}</strong>.
          </Text>
          <Text style={{ marginBottom: '24px' }}>
            The hiring team will reach out directly through your listing room in HireRoom.
          </Text>
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button href={p.dashboardUrl} style={buttonPrimaryStyle}>
              Go to Dashboard
            </Button>
          </Section>
        </EmailLayout>
      );
    }

    case 'candidate_hired': {
      const p = payload as EmailPayloadMap['candidate_hired'];
      return (
        <EmailLayout
          previewText={`Congratulations! You have been hired for ${p.listingTitle}.`}
          headline={
            <>
              Congratulations, You&apos;re <span style={{ color: '#E11D48', fontStyle: 'italic' }}>Hired</span>!
            </>
          }
          unsubscribeUrl={unsubscribeUrl}
          isEssential={isEssential}
        >
          <Text style={{ marginBottom: '16px' }}>
            {p.isCompanyConfirmation ? `Hi ${p.companyName} Team,` : `Hi ${p.candidateName},`}
          </Text>
          <Text style={{ marginBottom: '16px' }}>
            {p.isCompanyConfirmation
              ? `You have marked ${p.candidateName} as hired for ${p.listingTitle}. Next steps are documented in your hiring console.`
              : `Congratulations! ${p.companyName} has officially marked you as HIRED for ${p.listingTitle}. All remaining onboarding and details are inside HireRoom.`}
          </Text>
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button href={p.dashboardUrl} style={buttonPrimaryStyle}>
              View Hiring Details
            </Button>
          </Section>
        </EmailLayout>
      );
    }

    case 'candidate_not_selected': {
      const p = payload as EmailPayloadMap['candidate_not_selected'];
      return (
        <EmailLayout
          previewText={`Update regarding ${p.listingTitle} at ${p.companyName}.`}
          headline={
            <>
              Application <span style={{ color: '#E11D48', fontStyle: 'italic' }}>Update</span>
            </>
          }
          unsubscribeUrl={unsubscribeUrl}
          isEssential={isEssential}
        >
          <Text style={{ marginBottom: '16px' }}>Hi {p.candidateName},</Text>
          <Text style={{ marginBottom: '16px' }}>
            Thank you for applying to <strong>{p.listingTitle}</strong> at{' '}
            <strong>{p.companyName}</strong>. The company has decided to move forward with other
            candidates for this specific role.
          </Text>
          <Text style={{ marginBottom: '24px' }}>
            Your profile remains active. We recommend checking other verified listings and open
            challenges on HireRoom:
          </Text>
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button href={p.rolesUrl} style={buttonPrimaryStyle}>
              Explore Open Roles
            </Button>
          </Section>
        </EmailLayout>
      );
    }

    case 'challenge_deadline_reminder': {
      const p = payload as EmailPayloadMap['challenge_deadline_reminder'];
      return (
        <EmailLayout
          previewText={`24 hours left to submit ${p.challengeTitle}.`}
          headline={
            <>
              24 Hours <span style={{ color: '#E11D48', fontStyle: 'italic' }}>Remaining</span>
            </>
          }
          unsubscribeUrl={unsubscribeUrl}
          isEssential={isEssential}
        >
          <Text style={{ marginBottom: '16px' }}>Hi {p.candidateName},</Text>
          <Text style={{ marginBottom: '16px' }}>
            This is a reminder that the deadline for <strong>{p.challengeTitle}</strong> at{' '}
            <strong>{p.companyName}</strong> is in 24 hours.
          </Text>
          <Text style={{ marginBottom: '24px' }}>
            <strong>Attempts left:</strong> {p.attemptsRemaining} •{' '}
            <strong>Deadline:</strong> {p.deadline}
          </Text>
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button href={p.submissionUrl} style={buttonPrimaryStyle}>
              Submit Your Entry
            </Button>
          </Section>
        </EmailLayout>
      );
    }

    case 'listing_closed_summary': {
      const p = payload as EmailPayloadMap['listing_closed_summary'];
      return (
        <EmailLayout
          previewText={`Summary for closed listing: ${p.listingTitle}.`}
          headline={
            <>
              Listing Closed <span style={{ color: '#E11D48', fontStyle: 'italic' }}>Summary</span>
            </>
          }
          unsubscribeUrl={unsubscribeUrl}
          isEssential={isEssential}
        >
          <Text style={{ marginBottom: '16px' }}>Hi {p.companyName} Team,</Text>
          <Text style={{ marginBottom: '16px' }}>
            Your listing <strong>{p.listingTitle}</strong> has officially closed. Here is the final
            summary:
          </Text>
          <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
            <li>Total Applicants: {p.applicantCount}</li>
            <li>Shortlisted Candidates: {p.shortlistedCount}</li>
          </ul>
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button href={p.dashboardUrl} style={buttonPrimaryStyle}>
              Review Closed Listing Inbox
            </Button>
          </Section>
        </EmailLayout>
      );
    }

    case 'campfire_announcement': {
      const p = payload as EmailPayloadMap['campfire_announcement'];
      return (
        <EmailLayout
          previewText={`Pinned announcement from ${p.hostName} in ${p.listingTitle}.`}
          headline={
            <>
              New Pinned <span style={{ color: '#E11D48', fontStyle: 'italic' }}>Announcement</span>
            </>
          }
          unsubscribeUrl={unsubscribeUrl}
          isEssential={isEssential}
        >
          <Text style={{ marginBottom: '16px' }}>Hi {p.memberName},</Text>
          <Text style={{ marginBottom: '16px' }}>
            <strong>{p.hostName}</strong> just posted a pinned announcement in the{' '}
            <strong>{p.listingTitle}</strong> Campfire room:
          </Text>
          <div
            style={{
              backgroundColor: '#FFF1F2',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px',
              fontStyle: 'italic',
              color: '#1B1420',
            }}
          >
            &ldquo;{p.announcementSnippet}&rdquo;
          </div>
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button href={p.campfireUrl} style={buttonPrimaryStyle}>
              Open Campfire Room
            </Button>
          </Section>
        </EmailLayout>
      );
    }

    default:
      throw new Error(`Unsupported email event: ${event}`);
  }
}

export async function renderEmail<T extends EmailEvent>(
  event: T,
  payload: EmailPayloadMap[T]
): Promise<{ subject: string; html: string; text: string }> {
  const subject = getEmailSubject(event, payload);
  const element = renderEmailTemplate(event, payload);
  const html = await render(element);
  const text = await render(element, { plainText: true });

  return { subject, html, text };
}
