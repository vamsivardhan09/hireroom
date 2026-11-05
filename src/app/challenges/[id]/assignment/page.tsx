'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Flame,
  Clock,
  CheckCircle2,
  Video,
  Play,
  Github,
  Globe,
  Plus,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useHireRoomStore } from '@/lib/store';
import { useAutosaveDraft } from '@/hooks/useAutosaveDraft';
import { ChallengeSubmissionSchema } from '@/lib/validations';

export default function ChallengeAssignmentHubPage() {
  const params = useParams();
  const router = useRouter();
  const { listings, applications, addSubmission, candidateProfile } = useHireRoomStore();

  const challengeId = params.id as string;
  const challenge = listings.find(l => l.id === challengeId) || listings[0];

  const currentApp = applications.find(
    a => a.listingId === challenge.id && a.candidateId === candidateProfile.userId
  ) || applications[0];

  // Submission Form States (Clean initial state with autosave support)
  const [demoUrl, setDemoUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState(candidateProfile.githubRepos?.[0]?.url || '');
  const [videoUrl, setVideoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [version, setVersion] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  const { saveDraft, clearDraft, hasDraft, lastSaved } = useAutosaveDraft(
    `assignment_submission_${challenge.id}`,
    {
      demoUrl,
      repoUrl,
      videoUrl,
      notes,
    }
  );

  const stages = [
    { num: 1, label: 'Applied', state: 'completed' },
    { num: 2, label: 'Assignment', state: 'active' },
    { num: 3, label: 'Interview', state: 'upcoming' },
    { num: 4, label: 'Offer', state: 'upcoming' },
    { num: 5, label: 'Hired', state: 'upcoming' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = ChallengeSubmissionSchema.safeParse({
      demoUrl,
      repoUrl,
      videoUrl,
      notes,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setValidationErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      addSubmission({
        applicationId: currentApp?.id || 'app-1',
        listingId: challenge.id,
        candidateId: candidateProfile.userId,
        version,
        demoUrl,
        repoUrl,
        videoUrl,
        notes,
      });

      clearDraft();
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      setVersion(prev => prev + 1);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }, 900);
  };

  return (
    <div className="min-h-screen bg-bg py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs text-ink-muted hover:text-ink font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to dashboard</span>
        </Link>
      </div>

      {/* Title & Badges Header (matches Screenshot 9) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-semibold border border-amber-200">
              Assignment pending
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-ink font-normal tracking-tight">
            {challenge.title}
          </h1>
          <div className="text-xs text-ink-muted mt-1">
            {challenge.companyName} • {challenge.location} • {challenge.pay}
          </div>
        </div>

        {/* Right Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Campfire button with unread count */}
          <Link
            href="/campfire"
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-surface border border-ink-border text-xs font-semibold text-accent hover:bg-surface-subtle shadow-xs"
          >
            <Flame className="w-3.5 h-3.5 fill-accent" />
            <span>Campfire (3+)</span>
          </Link>

          {/* Attempts badge */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>4/4 attempts</span>
          </div>

          {/* Countdown badge */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>25d 10h 35m</span>
          </div>
        </div>
      </div>

      {/* 5-Stage Stepper (matches Screenshot 9) */}
      <div className="bg-surface rounded-2xl border border-ink-border p-4 shadow-soft">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {stages.map((stage, idx) => {
            const isCompleted = stage.state === 'completed';
            const isActive = stage.state === 'active';

            return (
              <React.Fragment key={stage.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-ink text-white'
                        : isActive
                        ? 'bg-accent text-white ring-4 ring-accent-light'
                        : 'bg-surface-subtle text-ink-faint border border-ink-border'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : stage.num}
                  </div>
                  <span
                    className={`text-[11px] mt-1.5 font-medium ${
                      isActive ? 'text-ink font-semibold' : 'text-ink-faint'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
                {idx < stages.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      isCompleted ? 'bg-ink' : 'bg-ink-border'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Soft Banner: Connect your GitHub repo */}
      <div className="bg-surface rounded-2xl border border-ink-border p-4 shadow-soft flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-surface-subtle flex items-center justify-center text-ink">
            <Github className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-ink">Connected GitHub repo</div>
            <div className="text-[11px] text-ink-muted">
              {candidateProfile.githubRepos?.[0]?.name
                ? `${candidateProfile.githubUsername || 'candidate'}/${candidateProfile.githubRepos[0].name}`
                : 'Connect your repository'} • So the team can follow your build
            </div>
          </div>
        </div>
        <Link
          href={`/challenges/${challenge.id}/build`}
          className="text-xs text-ink-muted hover:text-ink font-medium"
        >
          Change repo →
        </Link>
      </div>

      {/* Two-Column Layout (matches Screenshot 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Video Embed & Brief Access */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-surface rounded-3xl border border-ink-border p-6 shadow-card space-y-3">
            <div className="flex items-center space-x-2 text-xs font-semibold text-ink">
              <Play className="w-4 h-4 text-accent fill-accent" />
              <span>Watch This to Understand the Idea Behind the Challenge</span>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-ink border border-ink-border shadow-inner">
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Idea Behind Challenge"
                className="w-full h-full"
                allowFullScreen
              />
            </div>
            <div className="pt-2 flex items-center justify-between text-xs text-ink-muted">
              <span>Duration: 11 mins</span>
              <a
                href="https://loom.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink flex items-center space-x-1"
              >
                <span>Open in Loom</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="bg-surface rounded-3xl border border-ink-border p-6 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-ink-faint">
                Challenge brief summary
              </h4>
              <Link
                href={`/challenges/${challenge.id}`}
                className="text-xs text-accent hover:underline font-medium"
              >
                View full brief
              </Link>
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              {challenge.challengeBrief || challenge.aboutRole}
            </p>
          </div>
        </div>

        {/* Right Column: Submit Card (matches Screenshot 9) */}
        <div className="lg:col-span-7">
          <div className="bg-surface rounded-3xl border border-ink-border p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg text-ink">Submit</h2>
                <div className="text-xs text-ink-muted">Version {version} of 4</div>
              </div>
              <span className="text-xs font-medium text-ink-faint">4/4 attempts</span>
            </div>

            {submittedSuccess ? (
              <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3 animate-fadeIn">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-semibold text-lg text-emerald-900">
                  Version {version} Submitted Successfully!
                </h3>
                <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                  The hiring team has received your demo and repository. Your submission has been scored against the rubric.
                </p>
                <div className="pt-2 flex justify-center space-x-3">
                  <Link
                    href="/dashboard"
                    className="px-5 py-2 rounded-full bg-emerald-700 text-white text-xs font-semibold"
                  >
                    View in Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setSubmittedSuccess(false);
                      setVersion(prev => prev + 1);
                    }}
                    className="px-5 py-2 rounded-full bg-surface border border-emerald-300 text-emerald-800 text-xs font-semibold"
                  >
                    Submit new version
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {hasDraft && (
                  <div className="flex justify-end">
                    <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-medium border border-emerald-200">
                      Draft autosaved {lastSaved ? `• ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                    </span>
                  </div>
                )}

                {/* Live Demo URL */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                    Live demo <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                    <input
                      type="url"
                      placeholder="https://your-assignment-demo.com"
                      value={demoUrl}
                      onChange={e => {
                        setDemoUrl(e.target.value);
                        saveDraft({ demoUrl: e.target.value });
                        if (validationErrors.demoUrl) setValidationErrors(prev => ({ ...prev, demoUrl: undefined }));
                      }}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-xs text-ink focus:outline-none focus:border-ink"
                    />
                  </div>
                  {validationErrors.demoUrl && (
                    <p className="text-xs font-medium text-rose-600 mt-1">{validationErrors.demoUrl}</p>
                  )}
                </div>

                {/* Repository URL */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                    Repository <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <Github className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                    <input
                      type="url"
                      placeholder="https://github.com/you/assignment"
                      value={repoUrl}
                      onChange={e => {
                        setRepoUrl(e.target.value);
                        saveDraft({ repoUrl: e.target.value });
                        if (validationErrors.repoUrl) setValidationErrors(prev => ({ ...prev, repoUrl: undefined }));
                      }}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-xs text-ink focus:outline-none focus:border-ink"
                    />
                  </div>
                  {validationErrors.repoUrl && (
                    <p className="text-xs font-medium text-rose-600 mt-1">{validationErrors.repoUrl}</p>
                  )}
                </div>

                {/* Walkthrough Video */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                    Walkthrough video <span className="text-accent">*</span>
                  </label>
                  <div className="p-3.5 rounded-xl border border-ink-border bg-surface-subtle/60 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs">
                      <Video className="w-4 h-4 text-accent" />
                      <div>
                        <div className="font-semibold text-ink">Add walkthrough video</div>
                        <div className="text-[11px] text-ink-muted">Required • English • Loom or YouTube</div>
                      </div>
                    </div>
                    <input
                      type="url"
                      placeholder="Loom or YouTube URL"
                      value={videoUrl}
                      onChange={e => {
                        setVideoUrl(e.target.value);
                        saveDraft({ videoUrl: e.target.value });
                        if (validationErrors.videoUrl) setValidationErrors(prev => ({ ...prev, videoUrl: undefined }));
                      }}
                      className="text-xs px-3 py-1 rounded-lg border border-ink-border bg-surface w-48 text-ink focus:outline-none"
                    />
                  </div>
                  {validationErrors.videoUrl && (
                    <p className="text-xs font-medium text-rose-600 mt-1">{validationErrors.videoUrl}</p>
                  )}
                </div>

                {/* Notes (optional) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                      Notes (optional)
                    </label>
                    <span className="text-[10px] text-ink-faint font-mono">{notes.length}/5000</span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={5000}
                    placeholder="Anything reviewers should know — login, setup, focus areas..."
                    value={notes}
                    onChange={e => {
                      setNotes(e.target.value);
                      saveDraft({ notes: e.target.value });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-xs text-ink leading-relaxed focus:outline-none focus:border-ink resize-none"
                  />
                </div>

                {/* Submit Version Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3 bg-ink text-white rounded-full text-xs font-semibold hover:bg-ink/90 shadow-soft transition-all disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Evaluating Submission...' : `Submit version ${version}`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <p className="text-[11px] text-ink-faint text-center pt-1 leading-relaxed">
                  Only include links that belong to this assignment. Unrelated links can get your application rejected.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
