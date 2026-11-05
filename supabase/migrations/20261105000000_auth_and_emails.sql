-- HireRoom Step R4: Auth and Emails Database Schema

-- 1. Email Outbox Table
CREATE TABLE IF NOT EXISTS public.email_outbox (
  id TEXT PRIMARY KEY,
  event TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  deduplication_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  last_attempt_at TIMESTAMPTZ,
  last_error TEXT,
  resend_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_email_outbox_pending 
ON public.email_outbox (status, attempts, created_at) 
WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_email_outbox_dedup 
ON public.email_outbox (deduplication_key);

-- 2. In-App Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user 
ON public.notifications (user_id, read, created_at DESC);

-- 3. Email Suppressions (Bounces, Complaints, Global Unsubscribes)
CREATE TABLE IF NOT EXISTS public.email_suppressions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL CHECK (reason IN ('bounce', 'complaint', 'unsubscribe')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_email_suppressions_email 
ON public.email_suppressions (email);

-- 4. Email Notification Preferences (User Opt-outs for non-essential mail)
CREATE TABLE IF NOT EXISTS public.email_preferences (
  email TEXT PRIMARY KEY,
  digests BOOLEAN NOT NULL DEFAULT true,
  announcements BOOLEAN NOT NULL DEFAULT true,
  reminders BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_suppressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

-- Notifications RLS: Users can read their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id OR auth.jwt()->>'email' = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id OR auth.jwt()->>'email' = user_id);

-- Preferences RLS: Users can view and update own preferences
CREATE POLICY "Users can view own preferences"
ON public.email_preferences FOR SELECT
TO authenticated
USING (auth.jwt()->>'email' = email);

CREATE POLICY "Users can update own preferences"
ON public.email_preferences FOR ALL
TO authenticated
USING (auth.jwt()->>'email' = email);

-- Service role has full bypass for outbox worker and hooks
CREATE POLICY "Service role full access to outbox"
ON public.email_outbox FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access to suppressions"
ON public.email_suppressions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
