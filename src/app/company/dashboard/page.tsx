'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  CheckCircle,
  XCircle,
  Star,
  Flame,
  Sparkles,
  ExternalLink,
  Github,
  Plus,
  Briefcase,
  Trophy,
  Filter,
  Check,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useHireRoomStore } from '@/lib/store';
import { ApplicationStatus, Listing } from '@/types';

export default function CompanyDashboardPage() {
  const { listings, applications, updateApplicationStatus, campfireRooms } = useHireRoomStore();

  const [activeTab, setActiveTab] = useState<'live' | 'draft' | 'pending_review' | 'closed'>('live');
  const [selectedListingId, setSelectedListingId] = useState<string>(listings[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredListings = listings.filter(l => l.status === activeTab);
  const selectedListing = listings.find(l => l.id === selectedListingId) || filteredListings[0];

  const listingApplications = selectedListing
    ? applications.filter(a => a.listingId === selectedListing.id)
    : [];

  const displayedApplications = listingApplications.filter(app => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

  const handleAction = (appId: string, newStatus: ApplicationStatus) => {
    updateApplicationStatus(appId, newStatus);
  };

  const currentCampfireRoom = campfireRooms.find(r => r.listingId === selectedListing?.id);

  return (
    <div className="min-h-screen bg-bg py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            Company Portal
          </span>
          <h1 className="font-display text-4xl sm:text-5xl text-ink font-normal tracking-tight mt-1 mb-1">
            Applicants <span className="italic text-accent">Inbox</span>
          </h1>
          <p className="text-sm text-ink-muted">
            Review proof of work, AI match summaries, and hire without spreadsheets.
          </p>
        </div>

        <Link
          href="/company/post"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-ink text-white rounded-full text-xs font-semibold hover:bg-ink/90 shadow-soft transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Listing</span>
        </Link>
      </div>

      {/* Tabs: Live, Draft, Pending review, Closed */}
      <div className="flex border-b border-ink-border space-x-6 text-sm font-medium">
        {(['live', 'draft', 'pending_review', 'closed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              const firstInTab = listings.find(l => l.status === tab);
              if (firstInTab) setSelectedListingId(firstInTab.id);
            }}
            className={`pb-3 capitalize transition-all border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-ink text-ink font-semibold'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {tab.replace('_', ' ')} ({listings.filter(l => l.status === tab).length})
          </button>
        ))}
      </div>

      {/* 2-Column: Listings selector on left, Applicants Cards on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Listings Selector Card */}
        <div className="lg:col-span-4 bg-surface rounded-3xl border border-ink-border p-4 shadow-soft space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-faint px-2 py-1">
            Your Listings ({filteredListings.length})
          </div>

          {filteredListings.length === 0 ? (
            <div className="text-xs text-ink-muted p-4 text-center">No listings in this state.</div>
          ) : (
            filteredListings.map(listing => {
              const isSelected = selectedListing?.id === listing.id;
              const count = applications.filter(a => a.listingId === listing.id).length;
              const isChallenge = listing.type === 'challenge';

              return (
                <div
                  key={listing.id}
                  onClick={() => setSelectedListingId(listing.id)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-ink bg-surface-subtle shadow-xs'
                      : 'border-transparent hover:bg-surface-subtle/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-ink line-clamp-1">
                      {listing.title}
                    </span>
                    <span className="text-[11px] px-2 py-0.2 rounded-full bg-surface border border-ink-border text-ink-muted font-mono">
                      {count}
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-muted flex items-center justify-between">
                    <span className="capitalize">{listing.type}</span>
                    <span>{listing.pay}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Listing Stats & Applicants Inbox */}
        <div className="lg:col-span-8 space-y-6">
          {selectedListing ? (
            <>
              {/* Selected Listing Summary Card */}
              <div className="bg-surface rounded-3xl border border-ink-border p-6 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h2 className="font-semibold text-lg text-ink">{selectedListing.title}</h2>
                    {selectedListing.type === 'challenge' && (
                      <span className="px-2 py-0.5 rounded-full bg-accent-light text-accent text-[11px] font-bold">
                        Challenge
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-ink-muted">
                    {selectedListing.location} • {selectedListing.pay} • Deadline: {selectedListing.deadline}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-ink">{selectedListing.viewsCount}</div>
                    <div className="text-[11px] text-ink-faint">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-ink">{listingApplications.length}</div>
                    <div className="text-[11px] text-ink-faint">Applied</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-status-shortlist">
                      {listingApplications.filter(a => a.status === 'shortlisted').length}
                    </div>
                    <div className="text-[11px] text-ink-faint">Shortlisted</div>
                  </div>

                  {currentCampfireRoom && (
                    <Link
                      href={`/campfire`}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-surface-subtle border border-ink-border hover:bg-surface text-accent text-xs font-semibold"
                    >
                      <Flame className="w-3.5 h-3.5 fill-accent" />
                      <span>Campfire Room</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-ink">
                  Applicants ({displayedApplications.length})
                </div>

                <div className="flex items-center space-x-2">
                  {(['all', 'new', 'shortlisted', 'hired', 'rejected'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                        statusFilter === s
                          ? 'bg-ink text-white font-semibold'
                          : 'bg-surface text-ink-muted hover:text-ink border border-ink-border'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Candidate Cards */}
              {displayedApplications.length === 0 ? (
                <div className="bg-surface rounded-3xl border border-ink-border p-12 text-center text-xs text-ink-muted">
                  No applicants matching this status.
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedApplications.map(app => {
                    return (
                      <div
                        key={app.id}
                        className="bg-surface rounded-3xl border border-ink-border p-6 shadow-soft space-y-4 hover:border-ink-muted transition-all"
                      >
                        {/* Header: Candidate Info & AI Match Badge */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={app.candidateAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                              alt={app.candidateName}
                              className="w-12 h-12 rounded-2xl object-cover border border-ink-border"
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-base text-ink">{app.candidateName}</h3>
                                {app.totalScore && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                                    {app.totalScore} pts
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-ink-muted">{app.candidateHeadline}</div>
                              <div className="text-[11px] text-ink-faint mt-0.5">{app.candidateLocation}</div>
                            </div>
                          </div>

                          {/* Match Pill */}
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center space-x-1 ${
                                app.aiMatch === 'strong'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : app.aiMatch === 'possible'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              <span>{app.aiMatch || 'Possible'} Match</span>
                            </span>
                          </div>
                        </div>

                        {/* AI Summary (Prompt B) */}
                        {app.aiSummary && (
                          <div className="p-3.5 bg-surface-subtle/80 rounded-2xl border border-ink-border text-xs leading-relaxed text-ink-muted">
                            <span className="font-semibold text-ink">AI Evidence Summary: </span>
                            {app.aiSummary}
                          </div>
                        )}

                        {/* Verified Skills */}
                        <div className="flex flex-wrap gap-1.5">
                          {app.candidateSkills.slice(0, 6).map(skill => (
                            <span
                              key={skill}
                              className="px-2.5 py-0.5 rounded-full bg-surface text-ink-muted border border-ink-border text-[11px] font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        {/* Actions Toolbar */}
                        <div className="pt-3 border-t border-ink-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="text-ink-faint">Status:</span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
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
                          </div>

                          {/* Action Buttons: Shortlist, Hire, Reject, Message */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleAction(app.id, 'shortlisted')}
                              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-semibold transition-all"
                            >
                              <Star className="w-3.5 h-3.5" />
                              <span>Shortlist</span>
                            </button>

                            <button
                              onClick={() => handleAction(app.id, 'hired')}
                              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold shadow-xs transition-all"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Hire</span>
                            </button>

                            <button
                              onClick={() => handleAction(app.id, 'rejected')}
                              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-surface text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-medium transition-all"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>

                            <Link
                              href="/campfire"
                              className="p-1.5 rounded-full border border-ink-border text-ink-muted hover:text-accent hover:bg-surface-subtle"
                              title="Message in Campfire"
                            >
                              <Flame className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="bg-surface rounded-3xl border border-ink-border p-12 text-center text-sm text-ink-muted">
              Select or create a listing on the left to review applicants.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
