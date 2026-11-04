'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Trophy,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  Lock,
  CheckCircle2,
  Play,
  ArrowRight,
  Flame,
  Gift,
  Coins,
  Percent,
} from 'lucide-react';
import { useHireRoomStore } from '@/lib/store';

export default function ChallengeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { listings, applications, candidateProfile } = useHireRoomStore();

  const challenge = listings.find(l => l.id === params.id) || listings.find(l => l.type === 'challenge');

  if (!challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-ink-muted mb-4">Challenge not found</p>
          <Link href="/roles?type=challenge" className="text-accent underline text-sm">
            Back to challenges
          </Link>
        </div>
      </div>
    );
  }

  const existingApp = applications.find(
    a => a.listingId === challenge.id && a.candidateId === candidateProfile.userId
  );

  const handleEnterChallenge = () => {
    router.push(`/challenges/${challenge.id}/build`);
  };

  return (
    <div className="min-h-screen bg-bg py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Breadcrumb (as in Screenshot 7) */}
      <div>
        <Link
          href="/roles?type=challenge"
          className="inline-flex items-center space-x-1.5 text-xs text-ink-muted hover:text-ink font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All challenges</span>
        </Link>
      </div>

      {/* Header (Screenshot 7) */}
      <div className="space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
          Challenge
        </span>
        <h1 className="font-display text-4xl sm:text-5xl text-ink font-normal tracking-tight">
          {challenge.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted">
          <span>Hosted by <strong className="text-ink">{challenge.companyName}</strong></span>
          {challenge.companyVerified && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Verified Studio</span>
            </span>
          )}
          <span>•</span>
          <span className="flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            {challenge.location}
          </span>
          <span>•</span>
          <span>Proof-of-work</span>
        </div>

        {/* Row of Reward Chips (Cash, Equity, Perks) */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {challenge.prize && (
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-surface border border-ink-border text-xs font-semibold text-ink shadow-xs">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>CASH PRIZE <strong className="text-amber-600">{challenge.prize}</strong></span>
            </div>
          )}
          {challenge.equity && (
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-surface border border-ink-border text-xs font-semibold text-ink shadow-xs">
              <Percent className="w-4 h-4 text-rose-500" />
              <span>EQUITY <strong className="text-rose-600">{challenge.equity}</strong></span>
            </div>
          )}
          {challenge.perks && challenge.perks.map((perk, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-surface-subtle text-ink-muted text-xs font-medium border border-ink-border"
            >
              <Gift className="w-3.5 h-3.5 text-accent" />
              <span>{perk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two-Column Layout (Screenshot 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Challenge Details */}
        <div className="lg:col-span-8 space-y-8">
          {/* About this challenge */}
          <div className="bg-surface rounded-3xl border border-ink-border p-6 sm:p-8 shadow-card space-y-4">
            <h3 className="font-semibold text-base text-ink">About this challenge</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              {challenge.aboutRole}
            </p>
          </div>

          {/* Video Player Embed: "Watch This to Understand the Idea Behind the Challenge" */}
          <div className="bg-surface rounded-3xl border border-ink-border p-6 shadow-card space-y-3">
            <h3 className="font-semibold text-sm text-ink flex items-center space-x-2">
              <Play className="w-4 h-4 text-accent fill-accent" />
              <span>Watch This to Understand the Idea Behind the Challenge</span>
            </h3>
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-ink/90 border border-ink-border flex items-center justify-center shadow-inner">
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Challenge Walkthrough"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* What to build */}
          <div className="bg-surface rounded-3xl border border-ink-border p-6 sm:p-8 shadow-card space-y-4">
            <h3 className="font-semibold text-base text-ink">What to build</h3>
            <ul className="space-y-3">
              {challenge.whatYouWillDo.map((item, idx) => (
                <li key={idx} className="flex items-start text-sm text-ink-muted">
                  <CheckCircle2 className="w-4 h-4 text-accent mr-3 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Who should enter */}
          <div className="bg-surface rounded-3xl border border-ink-border p-6 sm:p-8 shadow-card space-y-4">
            <h3 className="font-semibold text-base text-ink">Who should enter</h3>
            <ul className="space-y-3">
              {challenge.whatYouNeed.map((item, idx) => (
                <li key={idx} className="flex items-start text-sm text-ink-muted">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-3 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* How it works */}
          <div className="bg-surface rounded-3xl border border-ink-border p-6 sm:p-8 shadow-card space-y-4">
            <h3 className="font-semibold text-base text-ink">How it works</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-6 h-6 rounded-full bg-ink text-white text-xs font-semibold flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-ink">Enter the challenge</h4>
                  <p className="text-xs text-ink-muted">Register to unlock the brief and join the dedicated Campfire room.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="w-6 h-6 rounded-full bg-ink text-white text-xs font-semibold flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-ink">Build your solution</h4>
                  <p className="text-xs text-ink-muted">Ship a working prototype against the challenge brief and rubric.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="w-6 h-6 rounded-full bg-ink text-white text-xs font-semibold flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-ink">Get reviewed & rewarded</h4>
                  <p className="text-xs text-ink-muted">Top submissions are evaluated against the transparent scoring rubric.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Locked Resources Card */}
          <div className="bg-surface rounded-3xl border border-ink-border p-6 text-center space-y-3 shadow-soft">
            <div className="w-10 h-10 rounded-full bg-surface-subtle border border-ink-border flex items-center justify-center mx-auto text-ink-muted">
              <Lock className="w-5 h-5 text-accent" />
            </div>
            <h4 className="text-sm font-semibold text-ink">Locked Resources</h4>
            <p className="text-xs text-ink-muted max-w-sm mx-auto">
              Enter the challenge to unlock the complete API documentation, starter template repos, and founder office hour notes.
            </p>
          </div>

          {/* How we evaluate: 100-pt Rubric */}
          {challenge.scoringChecklist && (
            <div className="bg-surface rounded-3xl border border-ink-border p-6 sm:p-8 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base text-ink">How we evaluate</h3>
                <span className="text-xs font-semibold text-accent">100 points total</span>
              </div>
              <div className="space-y-3">
                {challenge.scoringChecklist.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-surface-subtle/70 border border-ink-border"
                  >
                    <span className="text-xs text-ink font-medium">{item.item}</span>
                    <span className="px-2.5 py-1 rounded-full bg-surface text-ink text-xs font-bold border border-ink-border shrink-0 ml-3">
                      {item.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky "Enter the Challenge" Card */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-surface rounded-3xl border border-ink-border p-6 sm:p-7 shadow-card space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
                Reward
              </span>
              <div className="text-2xl font-display font-medium text-ink">
                {challenge.prize || '$250 cash'}
              </div>
              {challenge.equity && (
                <div className="text-xs font-semibold text-rose-600">
                  + {challenge.equity} Equity grant
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-ink-border text-xs">
              <div className="flex items-center justify-between text-ink-muted">
                <span>Location</span>
                <span className="font-semibold text-ink">{challenge.location}</span>
              </div>
              <div className="flex items-center justify-between text-ink-muted">
                <span>Hosted by</span>
                <span className="font-semibold text-ink">{challenge.companyName}</span>
              </div>
              <div className="flex items-center justify-between text-ink-muted">
                <span>Attempts</span>
                <span className="font-semibold text-ink">{challenge.maxAttempts || 4} attempts</span>
              </div>
              <div className="flex items-center justify-between text-ink-muted">
                <span>Deadline</span>
                <span className="font-semibold text-ink">{challenge.deadline}</span>
              </div>
            </div>

            {existingApp ? (
              <div className="space-y-2">
                <Link
                  href={`/challenges/${challenge.id}/assignment`}
                  className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-ink text-white rounded-full text-xs font-semibold hover:bg-ink/90 shadow-soft transition-all"
                >
                  <span>Go to Assignment Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="text-center text-[11px] text-emerald-700 font-medium">
                  ✓ You have entered this challenge
                </div>
              </div>
            ) : (
              <button
                onClick={handleEnterChallenge}
                className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-ink text-white rounded-full text-xs font-semibold hover:bg-ink/90 shadow-soft transition-all"
              >
                <span>Enter the challenge</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
