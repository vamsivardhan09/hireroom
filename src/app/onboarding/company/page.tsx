'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, ShieldCheck, ArrowRight, Sparkles, MapPin, Users } from 'lucide-react';
import { useHireRoomStore } from '@/lib/store';

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
        } catch {
          setName('Tech Studio');
          setOneLiner('Building high-conviction tools and AI-powered workflows.');
        }
        setIsEnriching(false);
      }, 500);
    }
  };

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addCompany({
      name: name || 'Innovative Labs',
      website: website || 'https://labs.co',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      oneLiner: oneLiner || 'Building high-growth intelligent software and workflows.',
      city,
      isRemote,
      size,
      verified: true,
      status: 'active',
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
      name: name || 'Innovative Labs',
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
          {/* Input 1: Website URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                Company Website
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
                onChange={e => setWebsite(e.target.value)}
                onBlur={handleWebsiteBlur}
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-ink text-sm focus:outline-none focus:border-ink"
              />
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
              Company Name
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Studio"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-ink text-sm font-medium focus:outline-none focus:border-ink"
            />
          </div>

          {/* Input 2: One-line Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
              What do you do, in one line?
            </label>
            <input
              type="text"
              placeholder="e.g. Fast developer tools for real-time collaboration."
              value={oneLiner}
              onChange={e => setOneLiner(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-ink text-sm focus:outline-none focus:border-ink"
            />
          </div>

          {/* Input 3: City or Remote + Team Size */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                Location & Workplace
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIsRemote(!isRemote)}
                  className={`pill-chip text-xs ${isRemote ? 'active' : ''}`}
                >
                  Remote-first
                </button>
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-ink-border bg-surface">
                  <MapPin className="w-3.5 h-3.5 text-ink-muted" />
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="City"
                    className="text-xs text-ink focus:outline-none bg-transparent w-28"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                Team Size
              </label>
              <div className="flex flex-wrap gap-2">
                {(['1-10', '11-50', '51-200', '200+'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
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
