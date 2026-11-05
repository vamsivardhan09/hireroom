'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  Briefcase,
  Trophy,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  X,
  MapPin,
  Clock,
  ShieldCheck,
  Building,
  DollarSign,
  Edit3,
} from 'lucide-react';
import { useHireRoomStore } from '@/lib/store';
import { ListingType, ScoringRubricItem } from '@/types';
import { generateListingWithAI, getSuggestedSkillsForTitle } from '@/lib/ai';
import { useAutosaveDraft } from '@/hooks/useAutosaveDraft';
import { PostListingSchema } from '@/lib/validations';
import { formatCompensation, isIndianListing } from '@/lib/currency';

export default function CompanyPostListingPage() {
  const router = useRouter();
  const { addListing, companies, currentUser } = useHireRoomStore();

  // Step state: 0 = Pick Type, 1 = Title, 2 = What they do, 3 = Skills, 4 = Practical bits, 5 = Review & Publish
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [listingType, setListingType] = useState<ListingType>('job');

  // Form Fields
  const [title, setTitle] = useState('');
  const [whatTheyWillDo, setWhatTheyWillDo] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [pay, setPay] = useState('₹18L - ₹28L/yr');
  const [workplaceMode, setWorkplaceMode] = useState<'Remote' | 'On-site' | 'Hybrid'>('Remote');
  const [locationCity, setLocationCity] = useState('Bengaluru');
  const [deadline, setDeadline] = useState('In 30 days');

  // Challenge specifics
  const [maxAttempts, setMaxAttempts] = useState(4);
  const [prize, setPrize] = useState('₹75,000 cash prize');

  // AI-generated draft state
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [generatedAbout, setGeneratedAbout] = useState('');
  const [generatedWhatYouWillDo, setGeneratedWhatYouWillDo] = useState<string[]>([]);
  const [generatedWhatYouNeed, setGeneratedWhatYouNeed] = useState<string[]>([]);
  const [generatedRubric, setGeneratedRubric] = useState<ScoringRubricItem[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  const { saveDraft, clearDraft, hasDraft, lastSaved } = useAutosaveDraft('post_listing', {
    listingType,
    title,
    whatTheyWillDo,
    skills,
    pay,
    workplaceMode,
    locationCity,
    deadline,
    prize,
  });

  const activeCompany = companies[0] || {
    id: 'comp-kavach',
    name: 'Kavach Systems (Demo)',
    logo: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&auto=format&fit=crop&q=80',
    oneLiner: 'Zero-trust cryptographic infrastructure and access orchestration for distributed cloud systems.',
    verified: true,
  };

  // AI skill suggestions when title is typed
  const suggestedSkills = getSuggestedSkillsForTitle(title || 'Software Engineer');

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const addCustomSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customSkillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(customSkillInput.trim())) {
        setSkills([...skills, customSkillInput.trim()]);
      }
      setCustomSkillInput('');
    }
  };

  // Trigger AI Listing Writer (Prompt A)
  const handleProceedToReview = async () => {
    setIsGeneratingAI(true);
    setCurrentStep(5);

    const fullPay = listingType === 'challenge' ? prize : pay;
    const fullLoc = workplaceMode === 'Remote' ? 'Remote' : `${locationCity} (${workplaceMode})`;

    const aiResult = await generateListingWithAI({
      type: listingType,
      title: title || (listingType === 'challenge' ? 'Full-Stack Creator Challenge' : 'Software Engineer'),
      whatTheyWillDo: whatTheyWillDo || 'Build and deploy customer-facing web applications with modern tech stack.',
      skills: skills.length > 0 ? skills : suggestedSkills.slice(0, 4),
      pay: fullPay,
      location: fullLoc,
      deadline,
      companyName: activeCompany.name,
      companyOneLiner: activeCompany.oneLiner,
      maxAttempts,
      prize,
    });

    setGeneratedAbout(aiResult.aboutRole || '');
    setGeneratedWhatYouWillDo(aiResult.whatYouWillDo || []);
    setGeneratedWhatYouNeed(aiResult.whatYouNeed || []);
    setGeneratedRubric(aiResult.scoringChecklist || []);
    setIsGeneratingAI(false);
  };

  const handlePublishListing = () => {
    const fullLoc = workplaceMode === 'Remote' ? 'Remote' : `${locationCity} (${workplaceMode})`;
    const rawPay = listingType === 'challenge' ? prize : pay;
    const formattedPay = formatCompensation(rawPay, fullLoc);

    const validation = PostListingSchema.safeParse({
      title: title || 'Full-Stack Developer',
      type: listingType,
      summary: whatTheyWillDo || `Join ${activeCompany.name} to build great software.`,
      pay: formattedPay,
      location: fullLoc,
      isRemote: workplaceMode === 'Remote',
      skills: skills.length > 0 ? skills : suggestedSkills.slice(0, 4),
      deadline,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach(issue => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setValidationErrors(fieldErrors);
      return;
    }

    clearDraft();

    const newListing = addListing({
      companyId: activeCompany.id,
      companyName: activeCompany.name,
      companyLogo: activeCompany.logo,
      companyVerified: activeCompany.verified,
      type: listingType,
      title: title || 'Full-Stack Developer',
      summary: whatTheyWillDo || `Join ${activeCompany.name} to build great software.`,
      aboutRole: generatedAbout || `Join ${activeCompany.name} to build high-impact software.`,
      whatYouWillDo: generatedWhatYouWillDo,
      whatYouNeed: generatedWhatYouNeed,
      skills: skills.length > 0 ? skills : suggestedSkills.slice(0, 4),
      pay: formattedPay,
      location: fullLoc,
      isRemote: workplaceMode === 'Remote',
      deadline,
      status: 'live',
      challengeBrief: listingType === 'challenge' ? whatTheyWillDo : undefined,
      deliverables: listingType === 'challenge' ? ['Working repository', 'Live deployment', 'Video demo'] : undefined,
      scoringChecklist: listingType === 'challenge' ? generatedRubric : undefined,
      maxAttempts: listingType === 'challenge' ? maxAttempts : undefined,
      prize: listingType === 'challenge' ? formattedPay : undefined,
      perks: listingType === 'challenge' ? ['API credits', 'Architecture review'] : undefined,
    });

    setIsPublished(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      router.push('/company/dashboard');
    }, 2500);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Header & Progress */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-ink-border">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              4-Question Posting Flow
            </span>
            <span className="text-xs text-ink-muted">•</span>
            <span className="text-xs font-medium text-ink-muted">
              {currentStep === 0
                ? 'Choose listing type'
                : `Question ${currentStep} of 4 ${currentStep === 4 ? '(almost there!)' : ''}`}
            </span>
          </div>

          <div className="w-32 h-1.5 bg-ink-border rounded-full overflow-hidden">
            <div
              className="h-full bg-ink transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* 2-Column Layout: Form on Left, Live Card Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Screens */}
          <div className="lg:col-span-7 space-y-6">
            {/* STEP 0: Select Type */}
            {currentStep === 0 && (
              <div className="bg-surface rounded-3xl border border-ink-border p-8 shadow-card space-y-6 animate-fadeIn">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Step 0
                </span>
                <h2 className="font-display text-3xl sm:text-4xl text-ink font-normal tracking-tight">
                  What kind of opportunity are you <span className="italic text-accent">posting</span>?
                </h2>
                <p className="text-sm text-ink-muted">
                  HireRoom supports full-time jobs, internships, and proof-based open challenges.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <button
                    onClick={() => {
                      setListingType('job');
                      setCurrentStep(1);
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      listingType === 'job'
                        ? 'border-ink bg-surface-subtle shadow-soft ring-1 ring-ink'
                        : 'border-ink-border hover:border-ink-muted'
                    }`}
                  >
                    <Briefcase className="w-6 h-6 text-ink mb-3" />
                    <div className="font-semibold text-sm text-ink mb-1">Full-Time Job</div>
                    <div className="text-xs text-ink-muted">Permanent roles with salary & equity.</div>
                  </button>

                  <button
                    onClick={() => {
                      setListingType('internship');
                      setCurrentStep(1);
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      listingType === 'internship'
                        ? 'border-ink bg-surface-subtle shadow-soft ring-1 ring-ink'
                        : 'border-ink-border hover:border-ink-muted'
                    }`}
                  >
                    <GraduationCap className="w-6 h-6 text-accent mb-3" />
                    <div className="font-semibold text-sm text-ink mb-1">Internship</div>
                    <div className="text-xs text-ink-muted">Early-career roles with monthly stipend.</div>
                  </button>

                  <button
                    onClick={() => {
                      setListingType('challenge');
                      setCurrentStep(1);
                    }}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      listingType === 'challenge'
                        ? 'border-accent bg-accent-light/40 shadow-soft ring-1 ring-accent'
                        : 'border-ink-border hover:border-accent'
                    }`}
                  >
                    <Trophy className="w-6 h-6 text-accent mb-3" />
                    <div className="font-semibold text-sm text-accent mb-1">Open Challenge</div>
                    <div className="text-xs text-ink-muted">Hire by proof-of-work with cash prize & rubric.</div>
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 1: Role Title */}
            {currentStep === 1 && (
              <div className="bg-surface rounded-3xl border border-ink-border p-8 shadow-card space-y-6 animate-fadeIn">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Question 1 of 4
                </span>
                <h2 className="font-display text-3xl sm:text-4xl text-ink font-normal tracking-tight">
                  What are you <span className="italic text-accent">hiring for</span>?
                </h2>
                <p className="text-sm text-ink-muted">
                  Keep it clear and recognizable. Candidates search by title.
                </p>

                <input
                  type="text"
                  placeholder="e.g. AI Product Engineer, Full-Stack Developer, Growth Intern"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && title && setCurrentStep(2)}
                  className="w-full px-4 py-3 rounded-xl border border-ink-border bg-surface text-base text-ink font-medium focus:outline-none focus:border-ink transition-colors"
                />

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={!title.trim()}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 bg-ink text-white rounded-full text-xs font-semibold hover:bg-ink/90 disabled:opacity-40 transition-all"
                  >
                    <span>Next question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCurrentStep(0)}
                    className="text-xs text-ink-muted hover:text-ink font-medium px-3 py-2"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 2: What will they do? */}
            {currentStep === 2 && (
              <div className="bg-surface rounded-3xl border border-ink-border p-8 shadow-card space-y-6 animate-fadeIn">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Question 2 of 4
                </span>
                <h2 className="font-display text-3xl sm:text-4xl text-ink font-normal tracking-tight">
                  {listingType === 'challenge' ? (
                    <>What should they <span className="italic text-accent">build or solve</span>?</>
                  ) : (
                    <>What will they <span className="italic text-accent">do</span>?</>
                  )}
                </h2>
                <p className="text-sm text-ink-muted">
                  Two lines is plenty. HireRoom’s AI will expand this into clear responsibilities.
                </p>

                <textarea
                  rows={4}
                  placeholder={
                    listingType === 'challenge'
                      ? 'e.g. Build an AI-assisted link-in-bio hub with automated inbox triage and opportunity routing for creators.'
                      : 'e.g. Build and scale our customer-facing Next.js applications and integrate realtime LLM workflow features.'
                  }
                  value={whatTheyWillDo}
                  onChange={e => setWhatTheyWillDo(e.target.value)}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-ink-border bg-surface text-sm text-ink leading-relaxed focus:outline-none focus:border-ink resize-none"
                />

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    onClick={() => setCurrentStep(3)}
                    disabled={!whatTheyWillDo.trim()}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 bg-ink text-white rounded-full text-xs font-semibold hover:bg-ink/90 disabled:opacity-40 transition-all"
                  >
                    <span>Next question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-xs text-ink-muted hover:text-ink font-medium px-3 py-2"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 3: Skills */}
            {currentStep === 3 && (
              <div className="bg-surface rounded-3xl border border-ink-border p-8 shadow-card space-y-6 animate-fadeIn">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Question 3 of 4
                </span>
                <h2 className="font-display text-3xl sm:text-4xl text-ink font-normal tracking-tight">
                  What should they be <span className="italic text-accent">good at</span>?
                </h2>
                <p className="text-sm text-ink-muted">
                  Tap to add AI-suggested skill chips based on your role title.
                </p>

                {/* AI Suggested Chips */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-ink-faint mb-2">
                    AI Suggestions (Tap to add)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSkills.map(s => {
                      const isSelected = skills.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSkill(s)}
                          className={`pill-chip text-xs ${isSelected ? 'active' : ''}`}
                        >
                          {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                          <span>{s}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom skill add */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-ink-faint mb-2">
                    Add custom skill
                  </div>
                  <input
                    type="text"
                    placeholder="Type a skill and press Enter"
                    value={customSkillInput}
                    onChange={e => setCustomSkillInput(e.target.value)}
                    onKeyDown={addCustomSkill}
                    className="w-full px-3.5 py-2 rounded-xl border border-ink-border bg-surface text-xs text-ink focus:outline-none focus:border-ink"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 bg-ink text-white rounded-full text-xs font-semibold hover:bg-ink/90 transition-all"
                  >
                    <span>Next question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-xs text-ink-muted hover:text-ink font-medium px-3 py-2"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 4: Practical bits */}
            {currentStep === 4 && (
              <div className="bg-surface rounded-3xl border border-ink-border p-8 shadow-card space-y-6 animate-fadeIn">
                <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Question 4 of 4
                </span>
                <h2 className="font-display text-3xl sm:text-4xl text-ink font-normal tracking-tight">
                  The <span className="italic text-accent">practical bits</span>
                </h2>
                <p className="text-sm text-ink-muted">
                  Compensation, work arrangement, and deadline.
                </p>

                {listingType === 'challenge' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                        Prize or Stipend
                      </label>
                      <input
                        type="text"
                        value={prize}
                        onChange={e => setPrize(e.target.value)}
                        placeholder="e.g. $250 cash + 10% equity, or ₹30,000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-sm text-ink focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                        Max Submission Attempts
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 4, 10].map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setMaxAttempts(n)}
                            className={`pill-chip text-xs ${maxAttempts === n ? 'active' : ''}`}
                          >
                            {n} attempts
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                      Compensation (Range or Fixed)
                    </label>
                    <input
                      type="text"
                      value={pay}
                      onChange={e => setPay(e.target.value)}
                      placeholder="e.g. ₹12L - ₹18L/yr or ₹25k/mo"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-sm text-ink focus:outline-none"
                    />
                  </div>
                )}

                {/* Workplace mode */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                    Location & Arrangement
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(['Remote', 'On-site', 'Hybrid'] as const).map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setWorkplaceMode(mode)}
                        className={`pill-chip text-xs ${workplaceMode === mode ? 'active' : ''}`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                  {workplaceMode !== 'Remote' && (
                    <input
                      type="text"
                      value={locationCity}
                      onChange={e => setLocationCity(e.target.value)}
                      placeholder="City (e.g. Bengaluru)"
                      className="w-full px-3.5 py-2 rounded-xl border border-ink-border bg-surface text-xs text-ink focus:outline-none"
                    />
                  )}
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                    Deadline
                  </label>
                  <input
                    type="text"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    placeholder="e.g. Nov 30, 12:00 AM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-sm text-ink focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    onClick={handleProceedToReview}
                    className="inline-flex items-center space-x-2 px-7 py-3 bg-ink text-white rounded-full text-xs font-semibold hover:bg-ink/90 shadow-soft transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span>Generate Full Listing with AI</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="text-xs text-ink-muted hover:text-ink font-medium px-3 py-2"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 5: AI Review & Inline Edit */}
            {currentStep === 5 && (
              <div className="bg-surface rounded-3xl border border-ink-border p-8 shadow-card space-y-6 animate-fadeIn">
                {isGeneratingAI ? (
                  <div className="py-12 text-center space-y-4">
                    <Sparkles className="w-8 h-8 text-accent animate-spin mx-auto" />
                    <h3 className="text-base font-semibold text-ink">
                      Writing honest, clear listing with AI...
                    </h3>
                    <p className="text-xs text-ink-muted">
                      Structuring deliverables, responsibilities, and 100-pt scoring rubric.
                    </p>
                  </div>
                ) : isPublished ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-2xl text-ink">Listing is Live!</h3>
                    <p className="text-xs text-ink-muted">
                      Campfire room created automatically. Redirecting to company inbox...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                          AI Draft Ready
                        </span>
                        <h2 className="font-display text-2xl text-ink font-normal tracking-tight mt-0.5">
                          Review & Publish
                        </h2>
                      </div>
                      <span className="text-xs text-ink-muted">Editable inline</span>
                    </div>

                    {/* About Role */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                        About the Role
                      </label>
                      <textarea
                        rows={3}
                        value={generatedAbout}
                        onChange={e => setGeneratedAbout(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-xs text-ink leading-relaxed focus:outline-none focus:border-ink"
                      />
                    </div>

                    {/* What You Will Do */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                        What You Will Do
                      </label>
                      <div className="space-y-1.5">
                        {generatedWhatYouWillDo.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                            <input
                              type="text"
                              value={item}
                              onChange={e => {
                                const copy = [...generatedWhatYouWillDo];
                                copy[idx] = e.target.value;
                                setGeneratedWhatYouWillDo(copy);
                              }}
                              className="w-full px-2 py-1 rounded-lg border border-ink-border/50 text-ink text-xs focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Challenge Rubric (if challenge) */}
                    {listingType === 'challenge' && (
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                          100-Point Scoring Rubric
                        </label>
                        <div className="space-y-2 p-3 bg-surface-subtle rounded-2xl border border-ink-border">
                          {generatedRubric.map(item => (
                            <div key={item.id} className="flex items-center justify-between text-xs">
                              <span className="text-ink font-medium">{item.item}</span>
                              <span className="px-2 py-0.5 bg-surface border border-ink-border rounded font-semibold text-ink shrink-0 ml-2">
                                {item.points} pts
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 flex items-center space-x-3">
                      <button
                        onClick={handlePublishListing}
                        className="inline-flex items-center space-x-2 px-8 py-3 bg-ink text-white rounded-full text-xs font-semibold hover:bg-ink/90 shadow-soft transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>Publish Listing Now</span>
                      </button>
                      <button
                        onClick={() => setCurrentStep(4)}
                        className="text-xs text-ink-muted hover:text-ink font-medium px-3 py-2"
                      >
                        Back to Edit
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Live Listing-Card Preview (as required in prompt) */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-faint mb-2 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Live Listing-Card Preview</span>
            </div>

            <div className="bg-surface rounded-3xl border border-ink-border p-6 shadow-card space-y-4">
              <div className="flex items-start justify-between">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeCompany.logo}
                  alt={activeCompany.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-ink-border"
                />
                <div className="flex items-center space-x-1">
                  {activeCompany.verified && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                      Verified
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-surface-subtle text-ink-muted text-[10px] font-semibold uppercase">
                    {listingType}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-base text-ink">
                  {title || (listingType === 'challenge' ? 'Open Challenge Title' : 'Role Title')}
                </h3>
                <div className="text-xs text-ink-muted mt-0.5">
                  {activeCompany.name} • {workplaceMode === 'Remote' ? 'Remote' : locationCity}
                </div>
              </div>

              <p className="text-xs text-ink-muted leading-relaxed line-clamp-3">
                {whatTheyWillDo ||
                  'Your two-line description will appear here as you type. Candidates will see this before clicking.'}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5">
                {(skills.length > 0 ? skills : suggestedSkills.slice(0, 3)).map(s => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-full bg-surface-subtle text-ink-muted text-[10px] font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-ink-border flex items-center justify-between text-xs">
                <div>
                  <span className="text-ink-faint text-[10px] block">Compensation</span>
                  <span className="font-semibold text-ink">
                    {listingType === 'challenge' ? prize : pay}
                  </span>
                </div>
                <span className="px-3 py-1 bg-surface-subtle text-ink rounded-full text-[11px] font-medium border border-ink-border">
                  View listing →
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
