'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Trophy,
  Briefcase,
  Flame,
  ShieldCheck,
  CheckCircle2,
  Users,
  Building,
} from 'lucide-react';
import { useHireRoomStore } from '@/lib/store';

export default function HomePage() {
  const { listings, companies } = useHireRoomStore();

  const challenges = listings.filter(l => l.type === 'challenge');
  const jobs = listings.filter(l => l.type !== 'challenge');

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero Section */}
      <section className="hero-radial py-20 px-4 sm:px-6 lg:px-8 text-center border-b border-ink-border/50">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-surface border border-ink-border text-xs font-semibold text-ink shadow-soft animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Zero external links. 4-question posting. Built for proof.</span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-ink font-normal tracking-tight leading-[1.08]">
            Hire by <span className="italic text-accent">proof</span>, <br className="hidden sm:inline" />
            not by resume.
          </h1>

          <p className="text-base sm:text-lg text-ink-muted max-w-xl mx-auto leading-relaxed">
            A company posts in four questions. Candidates apply with one profile and real work samples. Every listing gets an integrated Campfire room.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              href="/roles"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 bg-ink text-white rounded-full text-sm font-semibold hover:bg-ink/90 shadow-soft hover:shadow-card transition-all"
            >
              <span>Explore Roles & Challenges</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-surface border border-ink-border text-ink rounded-full text-sm font-semibold hover:bg-surface-subtle shadow-soft transition-all"
            >
              <span>Post a Role in 4 Questions</span>
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-ink-muted">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Domain Verified Companies</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Transparent 100-pt Rubrics</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Flame className="w-4 h-4 text-accent fill-accent" />
              <span>Listing-native Campfire Chat</span>
            </span>
          </div>
        </div>
      </section>

      {/* Featured Challenges */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Proof-of-work
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-ink font-normal tracking-tight mt-1">
              Active open <span className="italic text-accent">challenges</span>
            </h2>
          </div>
          <Link
            href="/roles?type=challenge"
            className="text-xs font-semibold text-ink hover:text-accent flex items-center space-x-1"
          >
            <span>View all challenges</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.slice(0, 2).map(challenge => (
            <div
              key={challenge.id}
              className="bg-surface rounded-3xl border border-ink-border p-7 shadow-soft hover:shadow-card hover:border-ink-muted transition-all flex flex-col justify-between space-y-6"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={challenge.companyLogo}
                    alt={challenge.companyName}
                    className="w-12 h-12 rounded-2xl object-cover border border-ink-border"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full bg-accent-light text-accent text-xs font-bold">
                      {challenge.prize || '$250'}
                    </span>
                    {challenge.equity && (
                      <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                        {challenge.equity} Equity
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-xl text-ink mb-1">{challenge.title}</h3>
                <div className="text-xs text-ink-muted mb-3">
                  Hosted by {challenge.companyName} • {challenge.location} • {challenge.maxAttempts || 4} attempts max
                </div>

                <p className="text-xs text-ink-muted leading-relaxed line-clamp-3 mb-4">
                  {challenge.summary}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {challenge.skills.map(s => (
                    <span
                      key={s}
                      className="px-2.5 py-0.5 rounded-full bg-surface-subtle text-ink-muted text-[11px] font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-ink-border flex items-center justify-between">
                <span className="text-xs text-ink-muted">Due {challenge.deadline}</span>
                <Link
                  href={`/challenges/${challenge.id}`}
                  className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-ink text-white rounded-full text-xs font-semibold hover:bg-ink/90 transition-all shadow-soft"
                >
                  <span>Enter Challenge</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Roles Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Direct Openings
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-ink font-normal tracking-tight mt-1">
              Featured <span className="italic text-accent">roles</span>
            </h2>
          </div>
          <Link
            href="/roles"
            className="text-xs font-semibold text-ink hover:text-accent flex items-center space-x-1"
          >
            <span>View all roles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {jobs.slice(0, 3).map(job => (
            <div
              key={job.id}
              className="bg-surface rounded-3xl border border-ink-border p-6 shadow-soft hover:shadow-card hover:border-ink-muted transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={job.companyLogo}
                    alt={job.companyName}
                    className="w-10 h-10 rounded-xl object-cover border border-ink-border"
                  />
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-subtle text-ink-muted text-[11px] font-medium capitalize">
                    {job.type}
                  </span>
                </div>

                <h3 className="font-semibold text-base text-ink line-clamp-1">{job.title}</h3>
                <div className="text-xs text-ink-muted mb-3">{job.companyName} • {job.location}</div>
                <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">{job.summary}</p>
              </div>

              <div className="pt-3 border-t border-ink-border flex items-center justify-between">
                <span className="text-xs font-semibold text-ink">{job.pay}</span>
                <Link
                  href={`/roles?id=${job.id}`}
                  className="text-xs font-semibold text-ink hover:text-accent flex items-center space-x-1"
                >
                  <span>View & Apply</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-ink-border/70 text-center text-xs text-ink-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-ink text-white flex items-center justify-center font-serif text-sm">
              H
            </div>
            <span className="font-display font-semibold text-base text-ink">
              Hire<span className="text-accent italic">Room</span>
            </span>
          </div>
          <div>Hire by proof, not by resume. Zero external links.</div>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="hover:text-ink">Candidate Dashboard</Link>
            <Link href="/company/dashboard" className="hover:text-ink">Company Inbox</Link>
            <Link href="/campfire" className="hover:text-ink">Campfire</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
