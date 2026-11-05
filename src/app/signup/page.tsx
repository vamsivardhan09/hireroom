'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Mail,
  Building,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useHireRoomStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '';

  const { setCurrentUser } = useHireRoomStore();
  const [role, setRole] = useState<'candidate' | 'company'>('candidate');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const targetOnboarding = role === 'company' ? '/onboarding/company' : '/onboarding/candidate';

    // 1. Dispatch welcome email notification asynchronously
    fetch('/api/auth/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        role,
        name: role === 'company' ? 'Company Team' : cleanEmail.split('@')[0],
      }),
    }).catch(err => console.warn('[signup] Welcome email dispatch error:', err));

    // 2. Authenticate with Supabase if configured
    const supabase = createClient();
    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            data: {
              role,
              onboarding_completed: false,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(targetOnboarding)}`,
          },
        });

        if (error) throw error;

        window.location.href = targetOnboarding;
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to create account.');
        setIsLoading(false);
      }
    } else {
      // 3. Local test / dev mode session setup
      const testUser = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        role,
        onboarding_completed: false,
      };

      document.cookie = `hireroom_test_user=${encodeURIComponent(
        JSON.stringify(testUser)
      )}; path=/; max-age=604800; SameSite=Lax`;

      setCurrentUser({
        id: testUser.id,
        email: testUser.email,
        name: role === 'company' ? 'New Company' : 'New Candidate',
        role,
      });

      setIsLoading(false);
      window.location.href = targetOnboarding;
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const targetOnboarding = role === 'company' ? '/onboarding/company' : '/onboarding/candidate';
    const supabase = createClient();

    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
            redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(targetOnboarding)}`,
          },
        });
        if (error) throw error;
      } catch (err: any) {
        setErrorMessage(err?.message || 'Google signup failed.');
        setIsLoading(false);
      }
    } else {
      const testUser = {
        id: `usr-google-${Date.now()}`,
        email: 'google-newuser@example.com',
        role,
        onboarding_completed: false,
      };

      document.cookie = `hireroom_test_user=${encodeURIComponent(
        JSON.stringify(testUser)
      )}; path=/; max-age=604800; SameSite=Lax`;

      setCurrentUser({
        id: testUser.id,
        email: testUser.email,
        name: 'New Google User',
        role,
      });

      setTimeout(() => {
        setIsLoading(false);
        router.push(targetOnboarding);
      }, 400);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] hero-radial py-12 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            Get Started
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-ink font-normal tracking-tight mt-1 mb-2">
            Create your <span className="italic text-accent">account</span>
          </h1>
          <p className="text-sm text-ink-muted">
            Choose your role. Candidates apply with proof; companies post in 4 questions.
          </p>
        </div>

        <div className="bg-surface rounded-3xl border border-ink-border p-8 shadow-card space-y-6">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Google Sign-up */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className="w-full py-3 px-4 border border-ink-border rounded-2xl bg-surface hover:bg-surface-subtle text-ink text-xs font-semibold flex items-center justify-center space-x-2.5 transition-all shadow-soft"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-ink-border"></div>
            <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-ink-muted">
              or sign up with email
            </span>
            <div className="flex-grow border-t border-ink-border"></div>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-2">
                I am joining as a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    role === 'candidate'
                      ? 'border-ink bg-surface shadow-soft ring-1 ring-ink'
                      : 'border-ink-border hover:border-ink-muted bg-surface/50'
                  }`}
                >
                  <User
                    className={`w-5 h-5 mb-2 ${
                      role === 'candidate' ? 'text-accent' : 'text-ink-muted'
                    }`}
                  />
                  <div className="text-xs font-semibold text-ink">Candidate</div>
                  <div className="text-[11px] text-ink-muted mt-0.5">
                    Apply with one verified profile
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('company')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    role === 'company'
                      ? 'border-ink bg-surface shadow-soft ring-1 ring-ink'
                      : 'border-ink-border hover:border-ink-muted bg-surface/50'
                  }`}
                >
                  <Building
                    className={`w-5 h-5 mb-2 ${
                      role === 'company' ? 'text-accent' : 'text-ink-muted'
                    }`}
                  />
                  <div className="text-xs font-semibold text-ink">Company</div>
                  <div className="text-[11px] text-ink-muted mt-0.5">
                    Post roles and open challenges
                  </div>
                </button>
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                {role === 'company' ? 'Company work email' : 'Your email'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder={
                    role === 'company' ? 'founder@yourstartup.com' : 'you@example.com'
                  }
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-ink text-sm focus:outline-none focus:border-ink"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-ink text-white rounded-full text-xs font-semibold hover:bg-ink/90 shadow-soft transition-all disabled:opacity-50"
            >
              <span>{isLoading ? 'Creating account...' : 'Continue to Onboarding'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Sign In Link */}
          <div className="pt-4 border-t border-ink-border text-center text-xs text-ink-muted">
            Already have an account?{' '}
            <Link
              href={`/login${nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : ''}`}
              className="font-semibold text-accent hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading sign up...</div>}>
      <SignupContent />
    </Suspense>
  );
}
