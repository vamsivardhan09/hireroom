'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Mail, Lock, ShieldCheck, Sparkles, Building, User } from 'lucide-react';
import { useHireRoomStore } from '@/lib/store';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/dashboard';

  const { setCurrentUser } = useHireRoomStore();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'candidate' | 'company'>('candidate');
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);

    // Set authentication cookie for middleware and server verification
    const testUser = {
      id: `usr-${Date.now()}`,
      email: email.trim().toLowerCase(),
      role,
      onboarding_completed: true,
    };

    // Store test session cookie
    document.cookie = `hireroom_test_user=${encodeURIComponent(
      JSON.stringify(testUser)
    )}; path=/; max-age=604800; SameSite=Lax`;

    setCurrentUser({
      id: testUser.id,
      email: testUser.email,
      name: role === 'company' ? 'Kavach Systems Team' : email.split('@')[0],
      role,
      companyId: role === 'company' ? 'comp-kavach' : undefined,
    });

    setTimeout(() => {
      setIsLoading(false);
      // If candidate and role is company, or nextUrl is dashboard
      if (role === 'company' && nextUrl === '/dashboard') {
        router.push('/company/dashboard');
      } else {
        router.push(nextUrl);
      }
    }, 400);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] hero-radial py-12 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            Welcome Back
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-ink font-normal tracking-tight mt-1 mb-2">
            Sign in to <span className="italic text-accent">HireRoom</span>
          </h1>
          <p className="text-sm text-ink-muted">
            Hire by proof, not by resume. Zero external links.
          </p>
        </div>

        <div className="bg-surface rounded-3xl border border-ink-border p-8 shadow-card space-y-6">
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Account Type Selector for sign-in */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-2">
                Sign in as
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={`p-3 rounded-2xl border text-center text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                    role === 'candidate'
                      ? 'border-ink bg-ink text-white shadow-soft'
                      : 'border-ink-border text-ink hover:bg-surface-subtle'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Candidate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('company')}
                  className={`p-3 rounded-2xl border text-center text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                    role === 'company'
                      ? 'border-ink bg-ink text-white shadow-soft'
                      : 'border-ink-border text-ink hover:bg-surface-subtle'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Company</span>
                </button>
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                Work or personal email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder={role === 'company' ? 'founder@yourcompany.com' : 'you@example.com'}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-ink text-sm focus:outline-none focus:border-ink"
                />
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-ink text-white rounded-full text-xs font-semibold hover:bg-ink/90 shadow-soft transition-all disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign in & Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="pt-4 border-t border-ink-border text-center text-xs text-ink-muted">
            Don&apos;t have an account yet?{' '}
            <Link
              href={`/signup${nextUrl !== '/dashboard' ? `?next=${encodeURIComponent(nextUrl)}` : ''}`}
              className="font-semibold text-accent hover:underline"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading sign in...</div>}>
      <LoginContent />
    </Suspense>
  );
}
