'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  FileText,
  Check,
  X,
  Sparkles,
  RefreshCw,
  Building,
  GraduationCap,
  Clock,
  Eye,
  Rocket,
  Users,
  MapPin,
  Phone,
  Globe,
  Github,
  Linkedin,
} from 'lucide-react';
import { useHireRoomStore } from '@/lib/store';
import { parseResumeFile } from '@/lib/ai';

function CandidateOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { candidateProfile, updateCandidateProfile } = useHireRoomStore();

  const stepFromQuery = searchParams.get('step');
  const [currentStep, setCurrentStep] = useState<number>(stepFromQuery ? parseInt(stepFromQuery, 10) : 1);

  // Form states
  const [referralSource, setReferralSource] = useState<string>(candidateProfile.referralSource || '');
  const [targetRoles, setTargetRoles] = useState<string[]>(candidateProfile.targetRoles || ['Full-time employment']);
  const [uploadedFileName, setUploadedFileName] = useState<string>(candidateProfile.resumeFileName || 'vamsi_vardhan_resume.pdf');
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parsingProgressText, setParsingProgressText] = useState<string>('Pulling out your experience...');

  // Step 5 Editable Profile States
  const [name, setName] = useState(candidateProfile.name);
  const [headline, setHeadline] = useState(candidateProfile.headline);
  const [location, setLocation] = useState(candidateProfile.location);
  const [phone, setPhone] = useState(candidateProfile.phone);
  const [experience, setExperience] = useState(candidateProfile.experience);
  const [availability, setAvailability] = useState(candidateProfile.availability);
  const [about, setAbout] = useState(candidateProfile.about);
  const [skills, setSkills] = useState<string[]>(candidateProfile.skills);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState(candidateProfile.linkedinUrl || '');
  const [githubUrl, setGithubUrl] = useState(candidateProfile.githubUrl || 'https://github.com/vamsivardhan09');
  const [portfolioUrl, setPortfolioUrl] = useState(candidateProfile.portfolioUrl || '');

  // Step 4 simulation timer when entering step 4
  useEffect(() => {
    if (currentStep === 4) {
      setIsParsing(true);
      const timer1 = setTimeout(() => {
        setParsingProgressText('Extracting verified skills & project history...');
      }, 700);
      const timer2 = setTimeout(() => {
        setParsingProgressText('Formatting your HireRoom profile card...');
      }, 1400);
      const timer3 = setTimeout(() => {
        setIsParsing(false);
        setCurrentStep(5);
      }, 2100);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [currentStep]);

  const referralOptions = [
    { label: 'Google', icon: 'G' },
    { label: 'LinkedIn', icon: 'in' },
    { label: 'X', icon: '𝕏' },
    { label: 'YouTube', icon: '▶' },
    { label: 'Instagram', icon: '📷' },
    { label: 'A friend', icon: '👤' },
    { label: 'University', icon: '🎓' },
    { label: 'Unstop', icon: '⚡' },
    { label: 'Email', icon: '✉' },
    { label: 'Podcast', icon: '🎙' },
    { label: 'An event', icon: '📅' },
    { label: 'Somewhere else', icon: '•••' },
  ];

  const roleOptions = [
    { id: 'founder', label: 'Founder role', icon: <Rocket className="w-4 h-4" /> },
    { id: 'co-founder', label: 'Co-founder role', icon: <Users className="w-4 h-4" /> },
    { id: 'full-time', label: 'Full-time employment', icon: <Building className="w-4 h-4" /> },
    { id: 'contract', label: 'Part-time or contract', icon: <Clock className="w-4 h-4" /> },
    { id: 'internship', label: 'Internship', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'exploring', label: 'Just exploring', icon: <Eye className="w-4 h-4" /> },
  ];

  const toggleTargetRole = (label: string) => {
    if (targetRoles.includes(label)) {
      setTargetRoles(targetRoles.filter(r => r !== label));
    } else {
      setTargetRoles([...targetRoles, label]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setCurrentStep(4);
      const parsed = await parseResumeFile(file.name, name);
      if (parsed.name) setName(parsed.name);
      if (parsed.headline) setHeadline(parsed.headline);
      if (parsed.about) setAbout(parsed.about);
      if (parsed.skills) setSkills(parsed.skills);
    }
  };

  const handleSimulatedUpload = async () => {
    setUploadedFileName('vamsi_vardhan_resume.pdf');
    setCurrentStep(4);
    const parsed = await parseResumeFile('vamsi_vardhan_resume.pdf', name);
    if (parsed.name) setName(parsed.name);
    if (parsed.headline) setHeadline(parsed.headline);
    if (parsed.about) setAbout(parsed.about);
    if (parsed.skills) setSkills(parsed.skills);
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(newSkillInput.trim())) {
        setSkills([...skills, newSkillInput.trim()]);
      }
      setNewSkillInput('');
    }
  };

  const handleSaveProfile = () => {
    updateCandidateProfile({
      name,
      headline,
      location,
      phone,
      experience,
      availability,
      about,
      skills,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      targetRoles,
      referralSource,
    });

    // Mark candidate onboarding complete in session cookie
    const updatedUser = {
      id: candidateProfile.userId || `usr-${Date.now()}`,
      email: 'vamsi@hireroom.dev',
      role: 'candidate' as const,
      onboarding_completed: true,
    };

    document.cookie = `hireroom_test_user=${encodeURIComponent(
      JSON.stringify(updatedUser)
    )}; path=/; max-age=604800; SameSite=Lax`;

    router.push('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] hero-radial py-12 px-4 sm:px-6 flex flex-col justify-between">
      {/* Top Header / Progress Container */}
      <div className="max-w-2xl mx-auto w-full">
        {/* Top Progress bar and Skip link */}
        <div className="flex items-center justify-between mb-8">
          <div className="w-28 sm:w-36 h-1.5 bg-ink-border rounded-full overflow-hidden">
            <div
              className="h-full bg-ink rounded-full transition-all duration-300"
              style={{
                width:
                  currentStep === 1
                    ? '20%'
                    : currentStep === 2
                    ? '40%'
                    : currentStep === 3
                    ? '60%'
                    : currentStep === 4
                    ? '80%'
                    : '100%',
              }}
            />
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="text-xs text-ink-muted hover:text-ink font-medium tracking-wide"
          >
            Skip for now
          </button>
        </div>

        {/* STEP 1: Source */}
        {currentStep === 1 && (
          <div className="flex flex-col items-center text-center max-w-xl mx-auto pt-6 animate-fadeIn">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent mb-3">
              Two quick questions
            </span>
            <h1 className="font-display text-4xl sm:text-5xl text-ink font-normal tracking-tight mb-8">
              How did you hear <br />
              about <span className="italic text-accent">HireRoom</span>?
            </h1>

            {/* Pill Choice Chips */}
            <div className="flex flex-wrap justify-center gap-2.5 max-w-lg mb-10">
              {referralOptions.map(opt => {
                const isSelected = referralSource === opt.label;
                return (
                  <button
                    key={opt.label}
                    onClick={() => {
                      setReferralSource(opt.label);
                      setTimeout(() => setCurrentStep(2), 150);
                    }}
                    className={`pill-chip ${isSelected ? 'active' : ''}`}
                  >
                    <span className="text-xs opacity-70 font-mono">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {referralSource && (
              <button
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-ink text-white rounded-full text-sm font-semibold hover:bg-ink/90 shadow-soft transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* STEP 2: Intent */}
        {currentStep === 2 && (
          <div className="flex flex-col items-center text-center max-w-xl mx-auto pt-6 animate-fadeIn">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent mb-3">
              Last one
            </span>
            <h1 className="font-display text-4xl sm:text-5xl text-ink font-normal tracking-tight mb-3">
              What are you <span className="italic text-accent">looking for</span>?
            </h1>
            <p className="text-sm text-ink-muted mb-8">Pick one or multiple that fit.</p>

            {/* Grid of Large Pill Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-8">
              {roleOptions.map(role => {
                const isSelected = targetRoles.includes(role.label);
                return (
                  <button
                    key={role.id}
                    onClick={() => toggleTargetRole(role.label)}
                    className={`flex items-center space-x-3.5 p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-ink bg-surface shadow-soft ring-1 ring-ink'
                        : 'border-ink-border bg-surface/80 hover:bg-surface hover:border-ink-muted'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-ink text-white' : 'bg-surface-subtle text-ink-muted'
                      }`}
                    >
                      {role.icon}
                    </div>
                    <span className="text-sm font-medium text-ink">{role.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Nav */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center space-x-2 px-7 py-2.5 bg-ink text-white rounded-full text-sm font-semibold hover:bg-ink/90 shadow-soft transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentStep(1)}
                className="text-sm text-ink-muted hover:text-ink font-medium px-4 py-2"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Drop in your resume */}
        {currentStep === 3 && (
          <div className="flex flex-col items-center text-center max-w-xl mx-auto pt-6 animate-fadeIn">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent mb-3">
              Next up
            </span>
            <h1 className="font-display text-4xl sm:text-5xl text-ink font-normal tracking-tight mb-8">
              Drop in your <span className="italic text-accent">resume</span>
            </h1>

            {/* Resume Upload Card */}
            <div className="w-full bg-surface rounded-3xl border border-ink-border p-10 shadow-card mb-6">
              <div className="w-14 h-14 rounded-2xl bg-surface-subtle border border-ink-border flex items-center justify-center mx-auto mb-4 text-ink-muted">
                <UploadCloud className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-base font-semibold text-ink mb-1">Drop your resume here</h3>
              <p className="text-xs text-ink-muted mb-6">PDF or Word · up to 10 MB</p>

              <label className="inline-flex items-center space-x-2 px-6 py-2.5 bg-ink text-white rounded-full text-sm font-semibold hover:bg-ink/90 shadow-soft cursor-pointer transition-all">
                <span>Choose resume</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="mt-4">
                <button
                  onClick={handleSimulatedUpload}
                  className="text-xs text-accent hover:underline font-medium"
                >
                  Or click here to load sample verified resume
                </button>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep(5)}
              className="text-xs text-ink-muted hover:text-ink font-medium"
            >
              Skip for now
            </button>
          </div>
        )}

        {/* STEP 4: Shimmer Loading Screen */}
        {currentStep === 4 && (
          <div className="flex flex-col items-center text-center max-w-md mx-auto pt-10 animate-fadeIn">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent mb-3">
              Almost there
            </span>
            <h1 className="font-display text-4xl sm:text-5xl text-ink font-normal tracking-tight mb-3">
              Building your <span className="italic text-accent">profile</span>
            </h1>
            <p className="text-sm text-ink-muted mb-10 max-w-sm">
              Reading what you’ve done so far so HireRoom can meet you halfway.
            </p>

            {/* Animated card placeholder */}
            <div className="w-56 h-40 bg-surface rounded-3xl border border-ink-border shadow-card p-6 flex flex-col justify-center items-center space-y-3 animate-soft-pulse mb-6">
              <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center text-accent">
                <Sparkles className="w-5 h-5 animate-spin" />
              </div>
              <div className="w-24 h-2.5 bg-ink-border rounded-full" />
              <div className="w-36 h-2 bg-surface-subtle rounded-full" />
            </div>

            <p className="text-xs font-medium text-ink-muted animate-pulse">
              {parsingProgressText}
            </p>
          </div>
        )}

        {/* STEP 5: Editable Profile Review Form */}
        {currentStep === 5 && (
          <div className="max-w-2xl mx-auto pt-2 pb-12 animate-fadeIn">
            <div className="text-center mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                Profile ready
              </span>
              <h1 className="font-display text-4xl sm:text-5xl text-ink font-normal tracking-tight mt-1 mb-2">
                Here’s what we found, <span className="italic text-accent">{name.split(' ')[0]}</span>
              </h1>
              <p className="text-sm text-ink-muted">Tweak anything that looks off, then continue.</p>
            </div>

            {/* Single Card of Stacked Labeled Fields */}
            <div className="bg-surface rounded-3xl border border-ink-border p-6 sm:p-8 shadow-card space-y-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-ink text-sm font-medium focus:outline-none focus:border-ink transition-colors"
                />
              </div>

              {/* Headline */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                  Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-ink text-sm focus:outline-none focus:border-ink transition-colors"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-ink text-sm focus:outline-none focus:border-ink transition-colors"
                  />
                </div>
              </div>

              {/* Phone with +91 Indian code */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                  Phone
                </label>
                <div className="flex space-x-2">
                  <div className="flex items-center px-3 py-2.5 rounded-xl border border-ink-border bg-surface-subtle text-xs font-semibold text-ink shrink-0">
                    <span className="mr-1.5">🇮🇳</span> +91
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-ink text-sm focus:outline-none focus:border-ink transition-colors"
                  />
                </div>
              </div>

              {/* Experience & Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                    Experience
                  </label>
                  <select
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-ink text-sm focus:outline-none focus:border-ink"
                  >
                    <option value="0-1 years">0–1 years</option>
                    <option value="1-3 years">1–3 years</option>
                    <option value="3-5 years">3–5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                    Availability <span className="font-normal text-ink-faint">(Optional)</span>
                  </label>
                  <select
                    value={availability}
                    onChange={e => setAvailability(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-ink text-sm focus:outline-none focus:border-ink"
                  >
                    <option value="Immediate (within 15 days)">Immediate (within 15 days)</option>
                    <option value="1 Month">1 Month</option>
                    <option value="Not specified">Not specified</option>
                  </select>
                </div>
              </div>

              {/* About */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                  About
                </label>
                <textarea
                  rows={4}
                  value={about}
                  onChange={e => setAbout(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-ink text-sm leading-relaxed focus:outline-none focus:border-ink resize-none"
                />
              </div>

              {/* Skills (Removable Chips) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                  Skills
                </label>
                <div className="flex flex-wrap gap-2 p-3 rounded-2xl border border-ink-border bg-surface-subtle/50 mb-2">
                  {skills.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-surface text-ink text-xs font-medium border border-ink-border shadow-xs group"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-1.5 text-ink-faint hover:text-accent focus:outline-none"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add a skill and press Enter"
                  value={newSkillInput}
                  onChange={e => setNewSkillInput(e.target.value)}
                  onKeyDown={addSkill}
                  className="w-full px-3.5 py-2 rounded-xl border border-ink-border bg-surface text-ink text-xs focus:outline-none focus:border-ink"
                />
              </div>

              {/* Education */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                  Education
                </label>
                <div className="p-3.5 rounded-2xl border border-ink-border bg-surface text-xs text-ink space-y-1.5">
                  <div className="font-semibold">B.Tech in Information Technology — SV College of Engineering, Tirupati (2023–2026)</div>
                  <div className="text-ink-muted">Diploma in Engineering — Nuzvid Polytechnic College, Vijayawada (2020–2023)</div>
                </div>
              </div>

              {/* Links */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                  Links
                </label>
                <div className="space-y-2">
                  <div className="flex items-center px-3.5 py-2 rounded-xl border border-ink-border bg-surface">
                    <Linkedin className="w-4 h-4 text-ink-muted mr-3 shrink-0" />
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={e => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full text-xs text-ink focus:outline-none bg-transparent"
                    />
                  </div>
                  <div className="flex items-center px-3.5 py-2 rounded-xl border border-ink-border bg-surface">
                    <Github className="w-4 h-4 text-ink-muted mr-3 shrink-0" />
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={e => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full text-xs text-ink focus:outline-none bg-transparent"
                    />
                  </div>
                  <div className="flex items-center px-3.5 py-2 rounded-xl border border-ink-border bg-surface">
                    <Globe className="w-4 h-4 text-ink-muted mr-3 shrink-0" />
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={e => setPortfolioUrl(e.target.value)}
                      placeholder="yoursite.com"
                      className="w-full text-xs text-ink focus:outline-none bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleSaveProfile}
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center space-x-2 px-8 py-3 bg-ink text-white rounded-full text-sm font-semibold hover:bg-ink/90 shadow-soft transition-all"
                >
                  <span>Save & continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-surface border border-ink-border text-ink rounded-full text-sm font-medium hover:bg-surface-subtle transition-all"
                >
                  <RefreshCw className="w-4 h-4 text-ink-muted" />
                  <span>Re-upload</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CandidateOnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading onboarding...</div>}>
      <CandidateOnboardingContent />
    </Suspense>
  );
}
