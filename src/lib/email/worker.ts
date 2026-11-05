import { Resend } from 'resend';
import {
  getPendingOutbox,
  markOutboxProcessing,
  markOutboxSent,
  markOutboxFailed,
} from './outbox';
import { renderEmail } from './templates';
import { OutboxEmailRecord } from './types';

export interface WorkerRunResult {
  processed: number;
  sent: number;
  failed: number;
  errors: Array<{ id: string; event: string; recipient: string; error: string; attempts: number }>;
  items: Array<{ id: string; event: string; recipient: string; status: 'sent' | 'failed' }>;
}

export async function processEmailOutbox(options?: {
  limit?: number;
  dryRun?: boolean;
}): Promise<WorkerRunResult> {
  const limit = options?.limit || 50;
  const dryRun = options?.dryRun || false;

  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || 'HireRoom <hello@hireroom.com>';

  const pendingItems = await getPendingOutbox(limit);

  const result: WorkerRunResult = {
    processed: pendingItems.length,
    sent: 0,
    failed: 0,
    errors: [],
    items: [],
  };

  if (pendingItems.length === 0) {
    return result;
  }

  // Check if Resend API key is configured
  if (!resendApiKey) {
    const missingError = 'Missing required environment variable: RESEND_API_KEY. Configure it in .env.local to send live emails.';
    console.warn(`[email_worker] ${missingError}`);

    for (const item of pendingItems) {
      const attempts = await markOutboxProcessing(item.id);
      await markOutboxFailed(item.id, missingError, attempts);
      result.failed += 1;
      result.errors.push({
        id: item.id,
        event: item.event,
        recipient: item.recipient,
        error: missingError,
        attempts,
      });
      result.items.push({
        id: item.id,
        event: item.event,
        recipient: item.recipient,
        status: 'failed',
      });
    }

    return result;
  }

  const resend = new Resend(resendApiKey);

  for (const item of pendingItems) {
    const attempts = await markOutboxProcessing(item.id);

    try {
      // 1. Render template HTML and plain-text
      const { subject, html, text } = await renderEmail(item.event, item.payload);

      if (dryRun) {
        await markOutboxSent(item.id, `mock_resend_${Date.now()}`);
        result.sent += 1;
        result.items.push({
          id: item.id,
          event: item.event,
          recipient: item.recipient,
          status: 'sent',
        });
        continue;
      }

      // 2. Dispatch via Resend API
      const response = await resend.emails.send({
        from: emailFrom,
        to: item.recipient,
        subject,
        html,
        text,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const resendId = response.data?.id || `resend_${Date.now()}`;
      await markOutboxSent(item.id, resendId);

      result.sent += 1;
      result.items.push({
        id: item.id,
        event: item.event,
        recipient: item.recipient,
        status: 'sent',
      });
    } catch (err: any) {
      const errorMessage = err?.message || 'Unknown email delivery failure';
      console.error(`[email_worker] Delivery failed for ${item.id} (${item.event} to ${item.recipient}):`, errorMessage);
      await markOutboxFailed(item.id, errorMessage, attempts);

      result.failed += 1;
      result.errors.push({
        id: item.id,
        event: item.event,
        recipient: item.recipient,
        error: errorMessage,
        attempts,
      });
      result.items.push({
        id: item.id,
        event: item.event,
        recipient: item.recipient,
        status: 'failed',
      });
    }
  }

  return result;
}
