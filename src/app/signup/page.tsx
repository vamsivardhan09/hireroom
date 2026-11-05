'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Mail, Building, User, Sparkles, ShieldCheck } from 'lucide-react';
import { useHireRoomStore } from '@/lib/store';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '';

  const { setCurrentUser } = useHireRoomStore();
  const [role, setRole] = useState<'candidate' | 'company'>('candidate');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);

    // New user starts with onboarding not completed
    const testUser = {
      id: `usr-${Date.now()}`,
      email: email.trim().toLowerCase(),
      role,
      onboarding_completed: false,
    };

    // Store test session cookie
    document.cookie = `hireroom_test_user=${encodeURIComponent(
      JSON.stringify(testUser)
    )}; path=/; max-age=604800; SameSite=Lax`;

    setCurrentUser({
      id: testUser.id,
      email: testUser.email,
      name: role === 'company' ? 'New Company' : 'New Candidate',
      role,
    });

    setTimeout(() => {
      setIsLoading(false);
      // Directs to appropriate role onboarding
      if (role === 'company') {
        router.push('/onboarding/company');
      } else {
        router.push('/onboarding/candidate');
      }
    }, 400);
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
                  <User className={`w-5 h-5 mb-2 ${role === 'candidate' ? 'text-accent' : 'text-ink-muted'}`} />
                  <div className="text-xs font-semibold text-ink">Candidate</div>
                  <div className="text-[11px] text-ink-muted mt-0.5">Apply with one verified profile</div>
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
                  <Building className={`w-5 h-5 mb-2 ${role === 'company' ? 'text-accent' : 'text-ink-muted'}`} />
                  <div className="text-xs font-semibold text-ink">Company</div>
                  <div className="text-[11px] text-ink-muted mt-0.5">Post roles and open challenges</div>
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
                  placeholder={role === 'company' ? 'founder@yourstartup.com' : 'you@gmail.com'}
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
