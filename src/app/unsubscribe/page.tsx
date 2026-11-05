'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Shield, ArrowLeft } from 'lucide-react';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    digests: false,
    announcements: false,
    reminders: false,
  });

  const handleUnsubscribeAll = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/email/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, category: 'all' }),
      });
      if (res.ok) {
        setUnsubscribed(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] hero-radial py-12 px-4 flex flex-col justify-center items-center">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            Email Preferences
          </span>
          <h1 className="font-display text-4xl text-ink font-normal tracking-tight mt-1 mb-2">
            Notification <span className="italic text-accent">Settings</span>
          </h1>
          <p className="text-sm text-ink-muted">
            Manage the emails you receive from HireRoom.
          </p>
        </div>

        <div className="bg-surface rounded-3xl border border-ink-border p-8 shadow-card space-y-6">
          {unsubscribed ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-ink">Preferences Updated</h2>
              <p className="text-xs text-ink-muted">
                <strong>{email}</strong> has been unsubscribed from all non-essential HireRoom
                communications.
              </p>
              <div className="pt-4 border-t border-ink-border">
                <Link
                  href="/"
                  className="inline-flex items-center space-x-2 text-xs font-semibold text-accent hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to HireRoom</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                  Your email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-ink text-sm focus:outline-none focus:border-ink"
                />
              </div>

              <div className="p-3.5 bg-surface-subtle rounded-2xl border border-ink-border space-y-2">
                <div className="flex items-start space-x-2.5">
                  <Shield className="w-4 h-4 text-ink-muted mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-ink-muted leading-relaxed">
                    <strong>Essential account emails</strong> (sign-in verification links, application
                    status, and shortlist/hire notices) will always be delivered to maintain security
                    and hiring updates.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={loading || !email.trim()}
                onClick={handleUnsubscribeAll}
                className="w-full py-3 bg-ink text-white rounded-full text-xs font-semibold hover:bg-ink/90 shadow-soft transition-all disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Unsubscribe from Non-Essential Emails'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading preferences...</div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
