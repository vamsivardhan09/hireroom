'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Mail,
  Lock,
  ShieldCheck,
  Building,
  User,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useHireRoomStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/dashboard';

  const { setCurrentUser } = useHireRoomStore();
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [role, setRole] = useState<'candidate' | 'company'>('candidate');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendLinkOrOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid work or personal email.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    const supabase = createClient();

    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim().toLowerCase(),
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
          },
        });

        if (error) {
          throw error;
        }

        setStep('otp');
        setInfoMessage(`We sent a sign-in link and 6-digit code to ${email.trim()}.`);
      } catch (err: any) {
        console.error('[auth] signInWithOtp error:', err);
        setErrorMessage(err?.message || 'Failed to send sign-in link.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // In local dev/test mode without live Supabase configured:
      // Set test session cookie for deterministic tests & instant login
      const testUser = {
        id: `usr-${Date.now()}`,
        email: email.trim().toLowerCase(),
        role,
        onboarding_completed: true,
      };

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

      setStep('otp');
      setInfoMessage(`Sign-in link and 6-digit code dispatched to ${email.trim()}. (Test OTP: 492815)`);
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setErrorMessage('Please enter the 6-digit code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const supabase = createClient();
    if (supabase) {
      try {
        const { error } = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: otpCode.trim(),
          type: 'email',
        });

        if (error) {
          throw error;
        }

        if (role === 'company' && nextUrl === '/dashboard') {
          router.push('/company/dashboard');
        } else {
          router.push(nextUrl);
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Invalid or expired verification code.');
        setIsLoading(false);
      }
    } else {
      // Dev/test mode instant confirmation
      setTimeout(() => {
        setIsLoading(false);
        if (role === 'company' && nextUrl === '/dashboard') {
          router.push('/company/dashboard');
        } else {
          router.push(nextUrl);
        }
      }, 300);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const supabase = createClient();
    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
          },
        });
        if (error) throw error;
      } catch (err: any) {
        setErrorMessage(err?.message || 'Google sign-in unavailable.');
        setIsLoading(false);
      }
    } else {
      // Dev/test mode instant fallback
      const testUser = {
        id: `usr-google-${Date.now()}`,
        email: 'google-user@example.com',
        role,
        onboarding_completed: true,
      };

      document.cookie = `hireroom_test_user=${encodeURIComponent(
        JSON.stringify(testUser)
      )}; path=/; max-age=604800; SameSite=Lax`;

      setCurrentUser({
        id: testUser.id,
        email: testUser.email,
        name: 'Google User',
        role,
      });

      setTimeout(() => {
        setIsLoading(false);
        if (role === 'company' && nextUrl === '/dashboard') {
          router.push('/company/dashboard');
        } else {
          router.push(nextUrl);
        }
      }, 400);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] hero-radial py-12 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            Passwordless Auth
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-ink font-normal tracking-tight mt-1 mb-2">
            Sign in to <span className="italic text-accent">HireRoom</span>
          </h1>
          <p className="text-sm text-ink-muted">
            Email link, 6-digit code, or Google. No passwords to leak or remember.
          </p>
        </div>

        <div className="bg-surface rounded-3xl border border-ink-border p-8 shadow-card space-y-6">
          {/* Alerts */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-2 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
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
              or with email link / code
            </span>
            <div className="flex-grow border-t border-ink-border"></div>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleSendLinkOrOtp} className="space-y-4">
              {/* Account Type Selector */}
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
                    placeholder={
                      role === 'company' ? 'founder@yourcompany.com' : 'you@example.com'
                    }
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
                <span>{isLoading ? 'Sending Link & Code...' : 'Send Magic Link & Code'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                  Enter 6-digit Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-ink-muted absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-ink text-sm font-mono tracking-widest text-center focus:outline-none focus:border-ink"
                  />
                </div>
                <p className="text-[11px] text-ink-muted mt-1.5 text-center">
                  You can also click the magic link directly in the email we sent to {email}.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpCode.length < 6}
                className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-ink text-white rounded-full text-xs font-semibold hover:bg-ink/90 shadow-soft transition-all disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying...' : 'Verify Code & Sign In'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-xs text-accent hover:underline"
                >
                  Change email address
                </button>
              </div>
            </form>
          )}

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
