'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Clock,
  Star,
  CheckCircle2,
  ArrowRight,
  Trophy,
  Briefcase,
  Flame,
  Building,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useHireRoomStore } from '@/lib/store';

export default function CandidateDashboardPage() {
  const router = useRouter();
  const { candidateProfile, candidateStats, applications, listings } = useHireRoomStore();

  const userApplications = applications.filter(a => a.candidateId === candidateProfile.userId);

  // Open roles not applied to yet
  const appliedListingIds = new Set(userApplications.map(a => a.listingId));
  const openRoles = listings.filter(l => !appliedListingIds.has(l.id));

  const firstName = candidateProfile.name.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-bg py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      {/* Welcome Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
          Your dashboard
        </span>
        <h1 className="font-display text-4xl sm:text-5xl text-ink font-normal tracking-tight mt-1 mb-2">
          Welcome back, <span className="italic text-accent">{firstName}</span>
        </h1>
        <p className="text-sm text-ink-muted">
          Track every application in one place. See where you stand and discover new roles worth your time.
        </p>
      </div>

      {/* 4 Stat Cards (as seen in Screenshot 6) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Applications */}
        <div className="bg-surface rounded-2xl border border-ink-border p-5 shadow-soft flex items-center justify-between">
          <div>
            <div className="text-3xl font-display font-medium text-ink">
              {candidateStats.totalApplications}
            </div>
            <div className="text-xs text-ink-muted mt-1 font-medium">Total applications</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-subtle text-accent flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* In Review */}
        <div className="bg-surface rounded-2xl border border-ink-border p-5 shadow-soft flex items-center justify-between">
          <div>
            <div className="text-3xl font-display font-medium text-ink">
              {candidateStats.inReview}
            </div>
            <div className="text-xs text-ink-muted mt-1 font-medium">In review</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-subtle text-status-pending flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Shortlisted */}
        <div className="bg-surface rounded-2xl border border-ink-border p-5 shadow-soft flex items-center justify-between">
          <div>
            <div className="text-3xl font-display font-medium text-ink">
              {candidateStats.shortlisted}
            </div>
            <div className="text-xs text-ink-muted mt-1 font-medium">Shortlisted</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-subtle text-status-shortlist flex items-center justify-center">
            <Star className="w-5 h-5" />
          </div>
        </div>

        {/* Accepted / Hired */}
        <div className="bg-surface rounded-2xl border border-ink-border p-5 shadow-soft flex items-center justify-between">
          <div>
            <div className="text-3xl font-display font-medium text-ink">
              {candidateStats.accepted}
            </div>
            <div className="text-xs text-ink-muted mt-1 font-medium">Accepted</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-subtle text-status-hired flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Promo Banner (Screenshot 6: "Building something? Pitch your idea. Get resources to build.") */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#201726] via-[#2F1E33] to-[#4A283C] text-white p-7 sm:p-9 shadow-card">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400 via-rose-500 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-accent-light/80 block mb-2">
            Accelerator
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-normal tracking-tight mb-2">
            Building something <span className="italic text-rose-300">extraordinary</span>?
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mb-5">
            Pitch your idea directly to venture studios. Get technical guidance, compute credits, and non-dilutive grant resources.
          </p>
          <Link
            href="/roles?type=challenge"
            className="inline-flex items-center space-x-2 px-5 py-2 rounded-full bg-white text-ink text-xs font-semibold hover:bg-gray-100 transition-all shadow-soft"
          >
            <span>Explore open challenges</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Your Applications Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Your applications</h2>
          {userApplications.length > 0 && (
            <span className="text-xs text-ink-muted">{userApplications.length} active</span>
          )}
        </div>

        {userApplications.length === 0 ? (
          /* Empty state as seen in Screenshot 6 */
          <div className="bg-surface rounded-3xl border border-ink-border p-12 text-center shadow-soft">
            <div className="w-12 h-12 rounded-2xl bg-surface-subtle border border-ink-border flex items-center justify-center mx-auto mb-4 text-accent">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-ink mb-1">No applications yet</h3>
            <p className="text-xs text-ink-muted mb-6 max-w-sm mx-auto">
              Browse open roles and submit your first application to track your progress here.
            </p>
            <Link
              href="/roles"
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-ink text-white rounded-full text-xs font-semibold hover:bg-ink/90 shadow-soft transition-all"
            >
              <span>Browse open roles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          /* Active applications list */
          <div className="space-y-3">
            {userApplications.map(app => {
              const listing = listings.find(l => l.id === app.listingId);
              if (!listing) return null;

              const isChallenge = listing.type === 'challenge';

              return (
                <div
                  key={app.id}
                  className="bg-surface rounded-2xl border border-ink-border p-5 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-ink-muted transition-all"
                >
                  <div className="flex items-start space-x-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={listing.companyLogo}
                      alt={listing.companyName}
                      className="w-12 h-12 rounded-xl object-cover border border-ink-border shrink-0"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-base text-ink">{listing.title}</h4>
                        {isChallenge ? (
                          <span className="px-2 py-0.5 rounded-full bg-accent-light text-accent text-[11px] font-bold">
                            Challenge
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-surface-subtle text-ink-muted text-[11px] font-medium">
                            {listing.type}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-ink-muted mt-0.5">
                        {listing.companyName} • {listing.location} • Applied on {new Date(app.appliedAt).toLocaleDateString()}
                      </div>

                      {/* AI Match Badge & Summary */}
                      {app.aiSummary && (
                        <div className="mt-2 text-xs text-ink-muted bg-surface-subtle/70 p-2.5 rounded-xl border border-ink-border/50 max-w-2xl flex items-start space-x-2">
                          <Sparkles className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-ink">AI Analysis: </span>
                            {app.aiSummary}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        app.status === 'shortlisted'
                          ? 'bg-purple-100 text-purple-800'
                          : app.status === 'hired'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {app.status.replace('_', ' ')}
                    </span>

                    {/* Campfire link */}
                    <Link
                      href={`/campfire`}
                      className="p-2 rounded-full border border-ink-border hover:bg-surface-subtle text-accent"
                      title="Open Campfire chat"
                    >
                      <Flame className="w-4 h-4 fill-accent" />
                    </Link>

                    {/* Action button */}
                    {isChallenge ? (
                      <Link
                        href={`/challenges/${listing.id}/assignment`}
                        className="px-4 py-2 bg-ink text-white rounded-full text-xs font-semibold hover:bg-ink/90 transition-all"
                      >
                        Assignment Hub
                      </Link>
                    ) : (
                      <Link
                        href={`/roles?id=${listing.id}`}
                        className="px-4 py-2 bg-surface-subtle text-ink hover:bg-ink hover:text-white rounded-full text-xs font-semibold border border-ink-border transition-all"
                      >
                        View Listing
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Open Roles Grid (Screenshot 6: 2-column card grid) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">Open roles</h2>
            <p className="text-xs text-ink-muted">Roles you haven’t applied to yet</p>
          </div>
          <Link
            href="/roles"
            className="text-xs font-semibold text-ink hover:text-accent flex items-center space-x-1"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {openRoles.slice(0, 4).map(role => {
            const isChallenge = role.type === 'challenge';
            return (
              <div
                key={role.id}
                className="bg-surface rounded-2xl border border-ink-border p-5 shadow-soft hover:shadow-card hover:border-ink-muted transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start space-x-3.5 mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={role.companyLogo}
                      alt={role.companyName}
                      className="w-10 h-10 rounded-xl object-cover border border-ink-border shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-sm text-ink truncate">{role.title}</h4>
                        {isChallenge && (
                          <span className="px-2 py-0.2 bg-accent-light text-accent text-[10px] font-bold rounded-full shrink-0">
                            Challenge
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-ink-muted mt-0.5 truncate">
                        {role.companyName} • {role.location}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-ink-muted line-clamp-2 mb-4 leading-relaxed">
                    {role.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-ink-border flex items-center justify-between">
                  <div className="text-xs font-semibold text-ink">{role.pay}</div>
                  <Link
                    href={isChallenge ? `/challenges/${role.id}` : `/roles?id=${role.id}`}
                    className="text-xs font-medium text-ink-muted hover:text-ink hover:underline flex items-center space-x-1"
                  >
                    <span>View role</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
