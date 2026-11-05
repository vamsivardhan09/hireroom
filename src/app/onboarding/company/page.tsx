'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, ShieldCheck, ArrowRight, Sparkles, MapPin, Users } from 'lucide-react';
import { useHireRoomStore } from '@/lib/store';
import { useAutosaveDraft } from '@/hooks/useAutosaveDraft';
import { CompanyOnboardingSchema } from '@/lib/validations';

export default function CompanyOnboardingRoutePage() {
  const router = useRouter();
  const { addCompany, setCurrentUser, currentUser } = useHireRoomStore();

  const [website, setWebsite] = useState('');
  const [name, setName] = useState('');
  const [oneLiner, setOneLiner] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [isRemote, setIsRemote] = useState(true);
  const [size, setSize] = useState<'1-10' | '11-50' | '51-200' | '200+'>('11-50');
  const [isEnriching, setIsEnriching] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  const { saveDraft, clearDraft, hasDraft, lastSaved } = useAutosaveDraft('company_onboarding', {
    website,
    name,
    oneLiner,
    city,
    isRemote,
    size,
  });

  const handleWebsiteBlur = () => {
    if (website && !name) {
      setIsEnriching(true);
      setTimeout(() => {
        try {
          const domain = new URL(website.startsWith('http') ? website : `https://${website}`).hostname.replace('www.', '');
          const cleanName = domain.split('.')[0];
          const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
          setName(capitalized);
          setOneLiner(`Next-generation developer infrastructure & intelligent products at ${capitalized}.`);
          saveDraft({
            name: capitalized,
            oneLiner: `Next-generation developer infrastructure & intelligent products at ${capitalized}.`,
          });
        } catch {
          setName('Tech Studio');
          setOneLiner('Building high-conviction tools and AI-powered workflows.');
          saveDraft({
            name: 'Tech Studio',
            oneLiner: 'Building high-conviction tools and AI-powered workflows.',
          });
        }
        setIsEnriching(false);
      }, 500);
    }
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();

    const result = CompanyOnboardingSchema.safeParse({
      website,
      name,
      oneLiner,
      city,
      isRemote,
      size,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const fieldName = issue.path[0] as string;
        fieldErrors[fieldName] = issue.message;
      });
      setValidationErrors(fieldErrors);
      return;
    }

    clearDraft();

    const created = addCompany({
      name,
      website: website.startsWith('http') ? website : `https://${website}`,
      logo: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&auto=format&fit=crop&q=80',
      oneLiner,
      city,
      isRemote,
      size,
      verified: false, // Rule 3: Only true when verified by admin/domain
      status: 'pending',
    });

    // Mark user onboarding complete in session cookie
    const updatedUser = {
      id: currentUser.id || `usr-${Date.now()}`,
      email: currentUser.email || 'founder@company.com',
      role: 'company' as const,
      onboarding_completed: true,
    };

    document.cookie = `hireroom_test_user=${encodeURIComponent(
      JSON.stringify(updatedUser)
    )}; path=/; max-age=604800; SameSite=Lax`;

    setCurrentUser({
      ...currentUser,
      role: 'company',
      companyId: created.id,
      name,
    });

    router.push('/company/post');
  };

  return (
    <div className="min-h-screen hero-radial py-12 px-4 sm:px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            Company Onboarding
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-ink font-normal tracking-tight mt-1 mb-2">
            Set up your <span className="italic text-accent">company profile</span>
          </h1>
          <p className="text-sm text-ink-muted">
            Three inputs to get started. Zero lengthy enterprise setup forms.
          </p>
        </div>

        <form onSubmit={handleComplete} className="bg-surface rounded-3xl border border-ink-border p-6 sm:p-8 shadow-card space-y-6">
          {hasDraft && (
            <div className="flex justify-end">
              <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium border border-emerald-200">
                Draft autosaved {lastSaved ? `• ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
              </span>
            </div>
          )}

          {/* Input 1: Website URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                Company Website <span className="text-accent">*</span>
              </label>
              {isEnriching && (
                <span className="text-xs text-accent flex items-center space-x-1 animate-pulse">
                  <Sparkles className="w-3 h-3" />
                  <span>Enriching company details...</span>
                </span>
              )}
            </div>
            <div className="relative">
              <Globe className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="https://yourcompany.com"
                value={website}
                onChange={e => {
                  setWebsite(e.target.value);
                  saveDraft({ website: e.target.value });
                  if (validationErrors.website) setValidationErrors(prev => ({ ...prev, website: undefined }));
                }}
                onBlur={handleWebsiteBlur}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-ink text-sm focus:outline-none focus:border-ink"
              />
            </div>
            {validationErrors.website && (
              <p className="text-xs font-medium text-rose-600 mt-1">{validationErrors.website}</p>
            )}
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
              Company Name <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Kavach Systems (Demo)"
              value={name}
              onChange={e => {
                setName(e.target.value);
                saveDraft({ name: e.target.value });
                if (validationErrors.name) setValidationErrors(prev => ({ ...prev, name: undefined }));
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-ink text-sm font-medium focus:outline-none focus:border-ink"
            />
            {validationErrors.name && (
              <p className="text-xs font-medium text-rose-600 mt-1">{validationErrors.name}</p>
            )}
          </div>

          {/* Input 2: One-line Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
              What do you do, in one line? <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Fast developer tools for real-time collaboration."
              value={oneLiner}
              onChange={e => {
                setOneLiner(e.target.value);
                saveDraft({ oneLiner: e.target.value });
                if (validationErrors.oneLiner) setValidationErrors(prev => ({ ...prev, oneLiner: undefined }));
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-ink text-sm focus:outline-none focus:border-ink"
            />
            {validationErrors.oneLiner && (
              <p className="text-xs font-medium text-rose-600 mt-1">{validationErrors.oneLiner}</p>
            )}
          </div>

          {/* Input 3: City or Remote + Team Size */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                Location & Workplace <span className="text-accent">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !isRemote;
                    setIsRemote(nextVal);
                    saveDraft({ isRemote: nextVal });
                  }}
                  className={`pill-chip text-xs ${isRemote ? 'active' : ''}`}
                >
                  Remote-first
                </button>
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-ink-border bg-surface">
                  <MapPin className="w-3.5 h-3.5 text-ink-muted" />
                  <input
                    type="text"
                    value={city}
                    onChange={e => {
                      setCity(e.target.value);
                      saveDraft({ city: e.target.value });
                      if (validationErrors.city) setValidationErrors(prev => ({ ...prev, city: undefined }));
                    }}
                    placeholder="City"
                    className="text-xs text-ink focus:outline-none bg-transparent w-28"
                  />
                </div>
              </div>
              {validationErrors.city && (
                <p className="text-xs font-medium text-rose-600 mt-1">{validationErrors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                Team Size <span className="text-accent">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {(['1-10', '11-50', '51-200', '200+'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSize(s);
                      saveDraft({ size: s });
                    }}
                    className={`pill-chip text-xs ${size === s ? 'active' : ''}`}
                  >
                    <Users className="w-3 h-3" />
                    <span>{s} people</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Verification Callout */}
          <div className="p-4 bg-surface-subtle rounded-2xl border border-ink-border flex items-start space-x-3 text-xs text-ink-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-ink">Verified Company Badge: </span>
              Earned once your work email domain matches your website domain.
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-ink text-white rounded-full text-sm font-semibold hover:bg-ink/90 shadow-soft transition-all"
          >
            <span>Save & Continue to Post Listing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
