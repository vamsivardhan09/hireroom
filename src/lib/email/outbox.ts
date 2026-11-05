import { createAdminClient } from '@/lib/supabase/admin';
import {
  EmailEvent,
  EmailPayloadMap,
  OutboxEmailRecord,
  InAppNotification,
  EmailSuppression,
  EmailPreferences,
} from './types';

// In-memory fallback store used in test / local dev when Supabase DB is offline
const memoryOutbox: Map<string, OutboxEmailRecord<any>> = new Map();
const memoryNotifications: InAppNotification[] = [];
const memorySuppressions: Map<string, EmailSuppression> = new Map();
const memoryPreferences: Map<string, EmailPreferences> = new Map();

export async function addToOutbox<T extends EmailEvent>(params: {
  event: T;
  recipient: string;
  subject: string;
  payload: EmailPayloadMap[T];
  deduplicationKey: string;
}): Promise<{ record: OutboxEmailRecord<T>; isDuplicate: boolean }> {
  const { event, recipient, subject, payload, deduplicationKey } = params;

  // 1. Try Supabase Postgres if configured
  const supabase = createAdminClient();
  if (supabase) {
    try {
      // Check existing deduplication key
      const { data: existing } = await supabase
        .from('email_outbox')
        .select('*')
        .eq('deduplication_key', deduplicationKey)
        .single();

      if (existing) {
        return { record: existing as OutboxEmailRecord<T>, isDuplicate: true };
      }

      const id = `outbox_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newRecord = {
        id,
        event,
        recipient: recipient.toLowerCase().trim(),
        subject,
        payload,
        deduplication_key: deduplicationKey,
        status: 'pending' as const,
        attempts: 0,
        max_attempts: 3,
        last_attempt_at: null,
        last_error: null,
        resend_id: null,
        created_at: new Date().toISOString(),
        sent_at: null,
      };

      const { data, error } = await supabase
        .from('email_outbox')
        .insert(newRecord)
        .select()
        .single();

      if (!error && data) {
        return { record: data as OutboxEmailRecord<T>, isDuplicate: false };
      }
    } catch (err) {
      console.warn('[email_outbox] Supabase insert failed, falling back to local memory store', err);
    }
  }

  // 2. Memory store fallback (for deterministic tests and offline dev)
  for (const item of memoryOutbox.values()) {
    if (item.deduplication_key === deduplicationKey) {
      return { record: item as OutboxEmailRecord<T>, isDuplicate: true };
    }
  }

  const id = `outbox_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const record: OutboxEmailRecord<T> = {
    id,
    event,
    recipient: recipient.toLowerCase().trim(),
    subject,
    payload,
    deduplication_key: deduplicationKey,
    status: 'pending',
    attempts: 0,
    max_attempts: 3,
    last_attempt_at: null,
    last_error: null,
    resend_id: null,
    created_at: new Date().toISOString(),
    sent_at: null,
  };

  memoryOutbox.set(id, record);
  return { record, isDuplicate: false };
}

export async function getPendingOutbox(limit = 50): Promise<OutboxEmailRecord[]> {
  const supabase = createAdminClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('email_outbox')
        .select('*')
        .eq('status', 'pending')
        .lt('attempts', 3)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (!error && data) {
        return data as OutboxEmailRecord[];
      }
    } catch (err) {
      console.warn('[email_outbox] Supabase query failed, falling back to memory store', err);
    }
  }

  // Memory store fallback
  const pending: OutboxEmailRecord[] = [];
  for (const item of memoryOutbox.values()) {
    if (item.status === 'pending' && item.attempts < item.max_attempts) {
      pending.push({ ...item });
      if (pending.length >= limit) break;
    }
  }
  return pending;
}

export async function markOutboxProcessing(id: string): Promise<number> {
  const supabase = createAdminClient();
  if (supabase) {
    try {
      const { data } = await supabase
        .from('email_outbox')
        .select('attempts')
        .eq('id', id)
        .single();
      const currentAttempts = (data?.attempts || 0) + 1;
      await supabase
        .from('email_outbox')
        .update({
          status: 'processing',
          attempts: currentAttempts,
          last_attempt_at: new Date().toISOString(),
        })
        .eq('id', id);
      return currentAttempts;
    } catch {}
  }

  const item = memoryOutbox.get(id);
  if (item) {
    item.status = 'processing';
    item.attempts += 1;
    item.last_attempt_at = new Date().toISOString();
    return item.attempts;
  }
  return 1;
}

export async function markOutboxSent(id: string, resendId: string): Promise<void> {
  const supabase = createAdminClient();
  if (supabase) {
    try {
      await supabase
        .from('email_outbox')
        .update({
          status: 'sent',
          resend_id: resendId,
          sent_at: new Date().toISOString(),
          last_error: null,
        })
        .eq('id', id);
      return;
    } catch {}
  }

  const item = memoryOutbox.get(id);
  if (item) {
    item.status = 'sent';
    item.resend_id = resendId;
    item.sent_at = new Date().toISOString();
    item.last_error = null;
  }
}

export async function markOutboxFailed(id: string, errorMsg: string, attempts: number): Promise<void> {
  const finalStatus = attempts >= 3 ? 'failed' : 'pending';
  const supabase = createAdminClient();
  if (supabase) {
    try {
      await supabase
        .from('email_outbox')
        .update({
          status: finalStatus,
          last_error: errorMsg,
          last_attempt_at: new Date().toISOString(),
        })
        .eq('id', id);
      return;
    } catch {}
  }

  const item = memoryOutbox.get(id);
  if (item) {
    item.status = finalStatus;
    item.last_error = errorMsg;
    item.last_attempt_at = new Date().toISOString();
  }
}

export async function isEmailSuppressed(email: string): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();
  const supabase = createAdminClient();
  if (supabase) {
    try {
      const { data } = await supabase
        .from('email_suppressions')
        .select('email')
        .eq('email', cleanEmail)
        .single();
      if (data) return true;
    } catch {}
  }

  return memorySuppressions.has(cleanEmail);
}

export async function addEmailSuppression(
  email: string,
  reason: 'bounce' | 'complaint' | 'unsubscribe'
): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  const supabase = createAdminClient();
  if (supabase) {
    try {
      await supabase.from('email_suppressions').upsert({
        email: cleanEmail,
        reason,
        created_at: new Date().toISOString(),
      });
      return;
    } catch {}
  }

  memorySuppressions.set(cleanEmail, {
    email: cleanEmail,
    reason,
    createdAt: new Date().toISOString(),
  });
}

export async function isUserUnsubscribed(
  email: string,
  event: EmailEvent
): Promise<boolean> {
  // If globally suppressed (e.g. bounce or complaints), always suppressed
  if (await isEmailSuppressed(email)) return true;

  const cleanEmail = email.toLowerCase().trim();
  const supabase = createAdminClient();
  let prefs: EmailPreferences | null = null;

  if (supabase) {
    try {
      const { data } = await supabase
        .from('email_preferences')
        .select('*')
        .eq('email', cleanEmail)
        .single();
      if (data) prefs = data as EmailPreferences;
    } catch {}
  }

  if (!prefs) {
    prefs = memoryPreferences.get(cleanEmail) || null;
  }

  if (!prefs) return false;

  if (event === 'new_applicants_digest' && !prefs.digests) return true;
  if (event === 'campfire_announcement' && !prefs.announcements) return true;
  if (event === 'challenge_deadline_reminder' && !prefs.reminders) return true;

  return false;
}

export async function updateEmailPreferences(
  email: string,
  updates: Partial<Pick<EmailPreferences, 'digests' | 'announcements' | 'reminders'>>
): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  const supabase = createAdminClient();
  if (supabase) {
    try {
      await supabase.from('email_preferences').upsert({
        email: cleanEmail,
        ...updates,
        updated_at: new Date().toISOString(),
      });
      return;
    } catch {}
  }

  const existing = memoryPreferences.get(cleanEmail) || {
    email: cleanEmail,
    digests: true,
    announcements: true,
    reminders: true,
    updatedAt: new Date().toISOString(),
  };

  memoryPreferences.set(cleanEmail, {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function createInAppNotification(notification: {
  userId: string;
  event: EmailEvent;
  title: string;
  message: string;
  link?: string;
}): Promise<InAppNotification> {
  const notif: InAppNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    ...notification,
    read: false,
    createdAt: new Date().toISOString(),
  };

  const supabase = createAdminClient();
  if (supabase) {
    try {
      await supabase.from('notifications').insert({
        id: notif.id,
        user_id: notif.userId,
        event: notif.event,
        title: notif.title,
        message: notif.message,
        link: notif.link,
        read: false,
        created_at: notif.createdAt,
      });
    } catch {}
  }

  memoryNotifications.push(notif);
  return notif;
}

// Helpers for testing and diagnostics
export function __getMemoryOutbox(): OutboxEmailRecord[] {
  return Array.from(memoryOutbox.values());
}

export function __getMemoryNotifications(): InAppNotification[] {
  return [...memoryNotifications];
}

export function __clearMemoryStores(): void {
  memoryOutbox.clear();
  memoryNotifications.length = 0;
  memorySuppressions.clear();
  memoryPreferences.clear();
}
