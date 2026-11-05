import {
  EmailEvent,
  EmailPayloadMap,
  OutboxEmailRecord,
  isEssentialEmail,
} from './types';
import { getEmailSubject } from './templates';
import {
  addToOutbox,
  createInAppNotification,
  isEmailSuppressed,
  isUserUnsubscribed,
} from './outbox';

export function generateDeduplicationKey<T extends EmailEvent>(
  event: T,
  payload: EmailPayloadMap[T]
): string {
  const recipient = payload.recipient.toLowerCase().trim();

  switch (event) {
    case 'welcome_candidate':
    case 'welcome_company':
      return `${event}:${recipient}`;

    case 'signin_link':
      return `${event}:${recipient}:${Date.now()}`;

    case 'company_submitted_for_review': {
      const p = payload as EmailPayloadMap['company_submitted_for_review'];
      return `${event}:${p.companyName}:${p.listingTitle}`.toLowerCase();
    }

    case 'listing_decision': {
      const p = payload as EmailPayloadMap['listing_decision'];
      return `${event}:${recipient}:${p.listingTitle}:${p.approved ? 'approved' : 'changes'}`.toLowerCase();
    }

    case 'application_received': {
      const p = payload as EmailPayloadMap['application_received'];
      return `${event}:${recipient}:${p.listingId}`.toLowerCase();
    }

    case 'new_applicants_digest': {
      const today = new Date().toISOString().slice(0, 10);
      return `${event}:${recipient}:${today}`.toLowerCase();
    }

    case 'challenge_entered': {
      const p = payload as EmailPayloadMap['challenge_entered'];
      return `${event}:${recipient}:${p.challengeTitle}`.toLowerCase();
    }

    case 'submission_received': {
      const p = payload as EmailPayloadMap['submission_received'];
      return `${event}:${recipient}:${p.challengeTitle}:v${p.versionNumber}`.toLowerCase();
    }

    case 'new_submission_company': {
      const p = payload as EmailPayloadMap['new_submission_company'];
      return `${event}:${recipient}:${p.challengeTitle}:${p.candidateName}:v${p.versionNumber}`.toLowerCase();
    }

    case 'candidate_shortlisted': {
      const p = payload as EmailPayloadMap['candidate_shortlisted'];
      return `${event}:${recipient}:${p.listingTitle}`.toLowerCase();
    }

    case 'candidate_hired': {
      const p = payload as EmailPayloadMap['candidate_hired'];
      return `${event}:${recipient}:${p.listingTitle}:${p.isCompanyConfirmation ? 'company' : 'cand'}`.toLowerCase();
    }

    case 'candidate_not_selected': {
      const p = payload as EmailPayloadMap['candidate_not_selected'];
      return `${event}:${recipient}:${p.listingTitle}`.toLowerCase();
    }

    case 'challenge_deadline_reminder': {
      const p = payload as EmailPayloadMap['challenge_deadline_reminder'];
      const today = new Date().toISOString().slice(0, 10);
      return `${event}:${recipient}:${p.challengeTitle}:${today}`.toLowerCase();
    }

    case 'listing_closed_summary': {
      const p = payload as EmailPayloadMap['listing_closed_summary'];
      return `${event}:${recipient}:${p.listingTitle}`.toLowerCase();
    }

    case 'campfire_announcement': {
      const p = payload as EmailPayloadMap['campfire_announcement'];
      const snippetHash = p.announcementSnippet.substring(0, 30).trim().toLowerCase();
      return `${event}:${recipient}:${p.listingTitle}:${snippetHash}`;
    }

    default:
      return `${event}:${recipient}:${Date.now()}`;
  }
}

export async function notify<T extends EmailEvent>(
  event: T,
  payload: EmailPayloadMap[T]
): Promise<{
  queued: boolean;
  isDuplicate: boolean;
  suppressed?: boolean;
  record?: OutboxEmailRecord<T>;
  error?: string;
}> {
  try {
    const recipient = payload.recipient.toLowerCase().trim();
    if (!recipient || !recipient.includes('@')) {
      return { queued: false, isDuplicate: false, error: 'Invalid recipient email' };
    }

    const isEssential = isEssentialEmail(event);

    // 1. Check suppression list (bounces / complaints)
    if (await isEmailSuppressed(recipient)) {
      console.warn(`[notify] Email suppressed for ${recipient} (event: ${event})`);
      return { queued: false, isDuplicate: false, suppressed: true };
    }

    // 2. Check user notification preferences for non-essential emails
    if (!isEssential) {
      const unsubscribed = await isUserUnsubscribed(recipient, event);
      if (unsubscribed) {
        console.log(`[notify] User ${recipient} opted out of ${event}`);
        return { queued: false, isDuplicate: false, suppressed: true };
      }
    }

    // 3. Compute subject & deduplication key
    const subject = getEmailSubject(event, payload);
    const deduplicationKey = generateDeduplicationKey(event, payload);

    // 4. Create in-app notification
    await createInAppNotification({
      userId: recipient,
      event,
      title: subject,
      message: `New update regarding ${event.replace(/_/g, ' ')}`,
      link: (payload as any).campfireUrl || (payload as any).dashboardUrl || '/dashboard',
    });

    // 5. Insert into email_outbox
    const { record, isDuplicate } = await addToOutbox({
      event,
      recipient,
      subject,
      payload,
      deduplicationKey,
    });

    return {
      queued: !isDuplicate,
      isDuplicate,
      record,
    };
  } catch (err: any) {
    console.error(`[notify] Failed to dispatch notification for ${event}:`, err);
    return { queued: false, isDuplicate: false, error: err?.message || 'Notification error' };
  }
}
