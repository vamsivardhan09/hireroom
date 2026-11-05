'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  Building,
  Briefcase,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useHireRoomStore } from '@/lib/store';

export default function AdminConsolePage() {
  const { companies, listings, updateListing } = useHireRoomStore();

  const [activeTab, setActiveTab] = useState<'verification' | 'listings' | 'reports'>('verification');

  return (
    <div className="min-h-screen bg-bg py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ink-border">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-accent-light text-accent text-[11px] font-bold">
              Admin Console
            </span>
            <span className="text-xs text-ink-muted">• Guarded by ADMIN_EMAILS</span>
          </div>
          <h1 className="font-display text-4xl text-ink font-normal tracking-tight mt-1 mb-1">
            HireRoom <span className="italic text-accent">Operations</span>
          </h1>
          <p className="text-sm text-ink-muted">
            Verify company domains, approve first listings, and moderate reports.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ink-border space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('verification')}
          className={`pb-3 capitalize transition-all border-b-2 -mb-px ${
            activeTab === 'verification'
              ? 'border-ink text-ink font-semibold'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          Company Verification ({companies.length})
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 capitalize transition-all border-b-2 -mb-px ${
            activeTab === 'listings'
              ? 'border-ink text-ink font-semibold'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          Listings Approval ({listings.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 capitalize transition-all border-b-2 -mb-px ${
            activeTab === 'reports'
              ? 'border-ink text-ink font-semibold'
              : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          Moderation Reports (0)
        </button>
      </div>

      {/* Verification Tab Content */}
      {activeTab === 'verification' && (
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
            Companies Awaiting Domain Review
          </div>

          <div className="space-y-3">
            {companies.map(comp => (
              <div
                key={comp.id}
                className="bg-surface rounded-2xl border border-ink-border p-5 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={comp.logo}
                    alt={comp.name}
                    className="w-12 h-12 rounded-xl object-cover border border-ink-border shrink-0"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-base text-ink">{comp.name}</h3>
                      {comp.verified ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-200">
                          Pending Verification
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-ink-muted mt-0.5">
                      Website: <a href={comp.website} target="_blank" rel="noreferrer" className="underline hover:text-ink">{comp.website}</a> • {comp.city}
                    </div>
                    <div className="text-[11px] text-ink-faint mt-0.5">{comp.oneLiner}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button className="px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Verified Badge</span>
                  </button>
                  <button className="px-3.5 py-1.5 rounded-full bg-surface border border-rose-200 text-rose-600 text-xs font-medium hover:bg-rose-50 transition-all">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Listings Approval Tab */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
            Listings Review Queue
          </div>
          <div className="space-y-3">
            {listings.map(l => (
              <div
                key={l.id}
                className="bg-surface rounded-2xl border border-ink-border p-5 shadow-soft flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-sm text-ink">{l.title}</h4>
                    <span className="px-2 py-0.2 rounded-full bg-surface-subtle text-ink-muted text-[10px] uppercase font-bold">
                      {l.type}
                    </span>
                  </div>
                  <div className="text-xs text-ink-muted mt-0.5">{l.companyName} • {l.pay} • {l.location}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/roles?id=${l.id}`}
                    className="px-3 py-1.5 rounded-full bg-surface border border-ink-border text-xs text-ink hover:bg-surface-subtle"
                  >
                    Preview
                  </Link>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                    Live
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-surface rounded-3xl border border-ink-border p-12 text-center text-xs text-ink-muted">
          No active moderation reports. All Campfire rooms and listings are clean.
        </div>
      )}
    </div>
  );
}
