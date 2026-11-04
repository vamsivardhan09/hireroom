'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, ShieldCheck, MapPin, Users, ArrowRight, ExternalLink } from 'lucide-react';
import { useHireRoomStore } from '@/lib/store';

export default function CompaniesDirectoryPage() {
  const { companies, listings } = useHireRoomStore();

  return (
    <div className="min-h-screen bg-bg py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
          Verified Studios & Startups
        </span>
        <h1 className="font-display text-4xl sm:text-5xl text-ink font-normal tracking-tight mt-1 mb-2">
          Companies hiring on <span className="italic text-accent">HireRoom</span>
        </h1>
        <p className="text-sm text-ink-muted">
          All companies are domain-verified and review proof-of-work directly without third-party recruitment agencies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map(company => {
          const companyListings = listings.filter(l => l.companyId === company.id);

          return (
            <div
              key={company.id}
              className="bg-surface rounded-3xl border border-ink-border p-6 shadow-soft hover:shadow-card hover:border-ink-muted transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-ink-border"
                  />
                  {company.verified && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified Studio</span>
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-lg text-ink mb-1">{company.name}</h3>
                <div className="text-xs text-ink-muted mb-3 flex items-center space-x-3">
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {company.city} {company.isRemote ? '(Remote-first)' : ''}
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {company.size} people
                  </span>
                </div>

                <p className="text-xs text-ink-muted leading-relaxed mb-4">
                  {company.oneLiner}
                </p>
              </div>

              <div className="pt-4 border-t border-ink-border flex items-center justify-between">
                <span className="text-xs text-ink font-medium">
                  {companyListings.length} open {companyListings.length === 1 ? 'role' : 'roles'}
                </span>
                <Link
                  href={`/roles?company=${company.id}`}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-ink hover:text-accent"
                >
                  <span>View roles</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
