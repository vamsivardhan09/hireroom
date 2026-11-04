'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Briefcase,
  Trophy,
  GraduationCap,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Flame,
  ShieldCheck,
  X,
  Share2,
} from 'lucide-react';
import { useHireRoomStore } from '@/lib/store';
import { Listing, ListingType } from '@/types';

function RolesDirectoryContent() {
  const searchParams = useSearchParams();
  const { listings, applyToListing, applications, candidateProfile } = useHireRoomStore();

  const initialType = searchParams.get('type') as ListingType | null;
  const initialSelectedId = searchParams.get('id');

  const [selectedType, setSelectedType] = useState<string>(initialType || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [remoteOnly, setRemoteOnly] = useState<boolean>(false);
  const [activeListing, setActiveListing] = useState<Listing | null>(
    initialSelectedId ? listings.find(l => l.id === initialSelectedId) || null : null
  );
  const [applySuccess, setApplySuccess] = useState<boolean>(false);
  const [screeningAnswer1, setScreeningAnswer1] = useState('');
  const [screeningAnswer2, setScreeningAnswer2] = useState('');

  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      if (selectedType !== 'all' && item.type !== selectedType) return false;
      if (remoteOnly && !item.isRemote) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesCompany = item.companyName.toLowerCase().includes(query);
        const matchesSkill = item.skills.some(s => s.toLowerCase().includes(query));
        return matchesTitle || matchesCompany || matchesSkill;
      }
      return true;
    });
  }, [listings, selectedType, remoteOnly, searchQuery]);

  const appliedListingIds = useMemo(() => {
    return new Set(
      applications
        .filter(a => a.candidateId === candidateProfile.userId)
        .map(a => a.listingId)
    );
  }, [applications, candidateProfile.userId]);

  const handleApply = (listing: Listing) => {
    applyToListing(listing.id, {
      'Why are you excited about this role?': screeningAnswer1 || 'Excited to contribute hands-on skills.',
      'Earliest joining date': screeningAnswer2 || 'Immediate',
    });
    setApplySuccess(true);
    setTimeout(() => {
      setApplySuccess(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-bg py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          Verified Opportunities
        </span>
        <h1 className="font-display text-4xl sm:text-5xl text-ink font-normal tracking-tight mt-1 mb-2">
          Discover roles & <span className="italic text-accent">challenges</span>
        </h1>
        <p className="text-sm text-ink-muted">
          No external links. No resume black holes. Apply in one tap with your verified profile.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface rounded-2xl border border-ink-border p-4 shadow-soft mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by role, company, or skill..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-ink-border bg-surface-subtle/50 text-ink text-sm focus:outline-none focus:border-ink"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setSelectedType('all')}
            className={`pill-chip text-xs ${selectedType === 'all' ? 'active' : ''}`}
          >
            All Roles
          </button>
          <button
            onClick={() => setSelectedType('job')}
            className={`pill-chip text-xs ${selectedType === 'job' ? 'active' : ''}`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Jobs</span>
          </button>
          <button
            onClick={() => setSelectedType('internship')}
            className={`pill-chip text-xs ${selectedType === 'internship' ? 'active' : ''}`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Internships</span>
          </button>
          <button
            onClick={() => setSelectedType('challenge')}
            className={`pill-chip text-xs ${selectedType === 'challenge' ? 'active-accent' : ''}`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Open Challenges</span>
          </button>

          {/* Remote Toggle */}
          <label className="flex items-center space-x-2 text-xs text-ink-muted cursor-pointer ml-2">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={e => setRemoteOnly(e.target.checked)}
              className="rounded border-ink-border text-ink focus:ring-ink"
            />
            <span>Remote only</span>
          </label>
        </div>
      </div>

      {/* Grid of Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredListings.map(listing => {
          const isChallenge = listing.type === 'challenge';
          const isApplied = appliedListingIds.has(listing.id);

          return (
            <div
              key={listing.id}
              className="bg-surface rounded-3xl border border-ink-border p-6 shadow-soft hover:shadow-card hover:border-ink-muted transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top: Logo & Badges */}
                <div className="flex items-start justify-between mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={listing.companyLogo}
                    alt={listing.companyName}
                    className="w-12 h-12 rounded-2xl object-cover border border-ink-border"
                  />
                  <div className="flex items-center space-x-1.5">
                    {listing.companyVerified && (
                      <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    )}
                    {isChallenge ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-accent-light text-accent text-[11px] font-bold">
                        Challenge
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-subtle text-ink-muted text-[11px] font-medium capitalize">
                        {listing.type}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Company */}
                <h3 className="font-semibold text-lg text-ink mb-1 line-clamp-1">{listing.title}</h3>
                <div className="text-xs text-ink-muted mb-3 flex items-center space-x-2">
                  <span>{listing.companyName}</span>
                  <span>•</span>
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-0.5" />
                    {listing.location}
                  </span>
                </div>

                <p className="text-xs text-ink-muted line-clamp-3 mb-4 leading-relaxed">
                  {listing.summary}
                </p>

                {/* Skill Chips */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {listing.skills.slice(0, 4).map(skill => (
                    <span
                      key={skill}
                      className="px-2.5 py-0.5 rounded-full bg-surface-subtle text-ink-muted text-[11px] font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {listing.skills.length > 4 && (
                    <span className="text-[11px] text-ink-faint self-center">
                      +{listing.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom: Pay and Action */}
              <div className="pt-4 border-t border-ink-border flex items-center justify-between">
                <div>
                  <div className="text-xs text-ink-faint">Compensation</div>
                  <div className="text-xs sm:text-sm font-semibold text-ink">{listing.pay}</div>
                </div>

                {isChallenge ? (
                  <Link
                    href={`/challenges/${listing.id}`}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-ink text-white rounded-full text-xs font-semibold hover:bg-ink/90 transition-all shadow-soft"
                  >
                    <span>View Challenge</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button
                    onClick={() => setActiveListing(listing)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-surface-subtle hover:bg-ink hover:text-white text-ink border border-ink-border rounded-full text-xs font-semibold transition-all"
                  >
                    <span>{isApplied ? 'Applied' : 'View & Apply'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-over / Modal for Job Details & One-Tap Apply */}
      {activeListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-surface rounded-3xl shadow-float border border-ink-border overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-ink-border flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeListing.companyLogo}
                  alt={activeListing.companyName}
                  className="w-12 h-12 rounded-xl object-cover border border-ink-border"
                />
                <div>
                  <h3 className="font-semibold text-lg text-ink">{activeListing.title}</h3>
                  <div className="text-xs text-ink-muted">
                    {activeListing.companyName} • {activeListing.location} • {activeListing.pay}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveListing(null)}
                className="p-1.5 rounded-full text-ink-muted hover:text-ink hover:bg-surface-subtle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {applySuccess ? (
                <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-2xl animate-fadeIn">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-lg text-emerald-900 mb-1">
                    Application Submitted in One Tap!
                  </h4>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto mb-4">
                    Your profile and skills have been delivered directly to {activeListing.companyName}&apos;s review inbox. You have also been added to the Campfire room.
                  </p>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center space-x-2 px-5 py-2 bg-emerald-700 text-white rounded-full text-xs font-semibold"
                  >
                    <span>View in Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <>
                  {/* About the role */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-faint mb-2">
                      About the role
                    </h4>
                    <p className="text-sm text-ink-muted leading-relaxed">{activeListing.aboutRole}</p>
                  </div>

                  {/* What you will do */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-faint mb-2">
                      What you will do
                    </h4>
                    <ul className="space-y-2">
                      {activeListing.whatYouWillDo.map((item, idx) => (
                        <li key={idx} className="flex items-start text-xs sm:text-sm text-ink-muted">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 mr-2.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* What you need */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-faint mb-2">
                      What you need
                    </h4>
                    <ul className="space-y-2">
                      {activeListing.whatYouNeed.map((item, idx) => (
                        <li key={idx} className="flex items-start text-xs sm:text-sm text-ink-muted">
                          <span className="w-1.5 h-1.5 rounded-full bg-ink mt-2 mr-2.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Optional Screening Questions */}
                  <div className="p-4 bg-surface-subtle rounded-2xl border border-ink-border space-y-3">
                    <h4 className="text-xs font-semibold text-ink">Optional Screening Questions</h4>
                    <div>
                      <label className="block text-[11px] text-ink-muted mb-1">
                        Why are you excited to build with {activeListing.companyName}?
                      </label>
                      <input
                        type="text"
                        placeholder="Share 1 or 2 lines..."
                        value={screeningAnswer1}
                        onChange={e => setScreeningAnswer1(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-ink-border bg-surface text-xs text-ink focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* One-Tap Info Banner */}
                  <div className="flex items-center space-x-3 p-3.5 bg-accent-light/50 rounded-2xl border border-accent/20">
                    <Sparkles className="w-5 h-5 text-accent shrink-0" />
                    <div className="text-xs text-ink">
                      Applying as <span className="font-semibold">{candidateProfile.name}</span> with your verified profile and resume ({candidateProfile.skills.length} skills attached).
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            {!applySuccess && (
              <div className="p-4 bg-surface-subtle border-t border-ink-border flex items-center justify-between">
                <Link
                  href="/onboarding/candidate?step=5"
                  className="text-xs text-ink-muted hover:text-ink underline"
                >
                  Edit your profile
                </Link>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setActiveListing(null)}
                    className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleApply(activeListing)}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 bg-ink text-white rounded-full text-xs font-semibold hover:bg-ink/90 shadow-soft transition-all"
                  >
                    <span>One-Tap Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RolesDirectoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading opportunities...</div>}>
      <RolesDirectoryContent />
    </Suspense>
  );
}
