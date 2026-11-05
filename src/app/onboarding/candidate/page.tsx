'use client';

import React, { useState, Suspense } from 'react';
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
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useHireRoomStore } from '@/lib/store';

function CandidateOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { candidateProfile, updateCandidateProfile } = useHireRoomStore();

  const stepFromQuery = searchParams.get('step');
  const [currentStep, setCurrentStep] = useState<number>(stepFromQuery ? parseInt(stepFromQuery, 10) : 1);

  // Form states
  const [referralSource, setReferralSource] = useState<string>(candidateProfile.referralSource || '');
  const [targetRoles, setTargetRoles] = useState<string[]>(candidateProfile.targetRoles || ['Full-time employment']);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parsingProgressText, setParsingProgressText] = useState<string>('Reading what you’ve done so far...');
  const [parsingError, setParsingError] = useState<string | null>(null);

  // Overwrite prompt states
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showOverwriteModal, setShowOverwriteModal] = useState<boolean>(false);

  // Step 5 Editable Profile States
  const [name, setName] = useState(candidateProfile.name || '');
  const [headline, setHeadline] = useState(candidateProfile.headline || '');
  const [location, setLocation] = useState(candidateProfile.location || 'Bengaluru, India');
  
  // Format initial phone: drop leading 0 and strip +91 if present for input display
  const initialPhoneDigits = (candidateProfile.phone || '').replace(/^\+91\s*/, '').replace(/^0+/, '');
  const [phoneDigits, setPhoneDigits] = useState(initialPhoneDigits);

  const [experience, setExperience] = useState(candidateProfile.experience || '0-1 years');
  const [availability, setAvailability] = useState(candidateProfile.availability || 'Immediate (within 15 days)');
  const [about, setAbout] = useState(candidateProfile.about || '');
  const [skills, setSkills] = useState<string[]>(candidateProfile.skills || []);
  const [education, setEducation] = useState<{ degree: string; institution: string; year: string }[]>(
    candidateProfile.education || []
  );
  const [newSkillInput, setNewSkillInput] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState(candidateProfile.linkedinUrl || '');
  const [githubUrl, setGithubUrl] = useState(candidateProfile.githubUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(candidateProfile.portfolioUrl || '');
  const [lowConfidenceFields, setLowConfidenceFields] = useState<string[]>([]);

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

  const executeParse = async (file: File) => {
    setUploadedFileName(file.name);
    setCurrentStep(4);
    setIsParsing(true);
    setParsingError(null);
    setParsingProgressText('Extracting verified text from file...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to extract resume text.');
      }

      const data = json.data;
      if (data.name) setName(data.name);
      if (data.headline) setHeadline(data.headline);
      if (data.location) setLocation(data.location);
      if (data.phone) {
        setPhoneDigits(data.phone.replace(/^\+91\s*/, '').replace(/^0+/, ''));
      }
      if (data.about) setAbout(data.about);
      if (data.skills && Array.isArray(data.skills)) setSkills(data.skills);
      if (data.education && Array.isArray(data.education) && data.education.length > 0) {
        setEducation(data.education);
      }
      if (data.links?.linkedin) setLinkedinUrl(data.links.linkedin);
      if (data.links?.github) setGithubUrl(data.links.github);
      if (data.links?.portfolio) setPortfolioUrl(data.links.portfolio);
      if (data.lowConfidenceFields) setLowConfidenceFields(data.lowConfidenceFields);

      setIsParsing(false);
      setCurrentStep(5);
    } catch (err: any) {
      setIsParsing(false);
      setParsingError(err.message || 'Could not parse resume file. You can enter details manually.');
      setCurrentStep(5);
    }
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if profile already has data -> show overwrite prompt
    const hasExistingData = skills.length > 0 || about.length > 0 || name.length > 0;
    if (hasExistingData) {
      setPendingFile(file);
      setShowOverwriteModal(true);
    } else {
      executeParse(file);
    }
  };

  const confirmOverwrite = () => {
    setShowOverwriteModal(false);
    if (pendingFile) {
      executeParse(pendingFile);
      setPendingFile(null);
    }
  };

  const cancelOverwrite = () => {
    setShowOverwriteModal(false);
    setPendingFile(null);
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
    // Normalize phone with +91 and no leading 0
    const cleanDigits = phoneDigits.replace(/^0+/, '').trim();
    const formattedPhone = cleanDigits ? `+91 ${cleanDigits}` : '';

    updateCandidateProfile({
      name,
      headline,
      location,
      phone: formattedPhone,
      experience,
      availability,
      about,
      skills,
      education,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      targetRoles,
      referralSource,
    });

    // Mark candidate onboarding complete in session cookie
    const updatedUser = {
      id: candidateProfile.userId || `usr-${Date.now()}`,
      email: 'candidate@test.com',
      role: 'candidate' as const,
      onboarding_completed: true,
    };

    document.cookie = `hireroom_test_user=${encodeURIComponent(
      JSON.stringify(updatedUser)
    )}; path=/; max-age=604800; SameSite=Lax`;

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen hero-radial py-12 px-4 sm:px-6 flex flex-col justify-between">
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
            onClick={() => setCurrentStep(5)}
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
              <p className="text-xs text-ink-muted mb-6">PDF, DOCX, or text · up to 10 MB</p>

              <label className="inline-flex items-center space-x-2 px-6 py-2.5 bg-ink text-white rounded-full text-sm font-semibold hover:bg-ink/90 shadow-soft cursor-pointer transition-all">
                <span>Choose resume</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md"
                  onChange={handleFileSelection}
                  className="hidden"
                />
              </label>
            </div>

            <button
              onClick={() => setCurrentStep(5)}
              className="text-xs text-ink-muted hover:text-ink font-medium"
            >
              Skip and fill manually
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
                Here’s what we found{name ? `, ` : ''}<span className="italic text-accent">{name.split(' ')[0]}</span>
              </h1>
              <p className="text-sm text-ink-muted">Tweak anything that looks off, then continue.</p>
            </div>

            {/* Parsing error notification (if parsing failed, allows manual entry without silent mock fallback) */}
            {parsingError && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start space-x-3 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Notice: </span>
                  {parsingError}
                  <div className="text-[11px] text-amber-700 mt-1">
                    You can complete your profile details manually below and continue.
                  </div>
                </div>
              </div>
            )}

            {/* Single Card of Stacked Labeled Fields */}
            <div className="bg-surface rounded-3xl border border-ink-border p-6 sm:p-8 shadow-card space-y-5">
              {/* Name */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                    Name
                  </label>
                  {lowConfidenceFields.includes('name') && (
                    <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                      check this
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-ink text-sm font-medium focus:outline-none focus:border-ink transition-colors"
                />
              </div>

              {/* Headline */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                    Headline
                  </label>
                  {lowConfidenceFields.includes('headline') && (
                    <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                      check this
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="e.g. Full-Stack Engineer, Product Designer"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-ink text-sm focus:outline-none focus:border-ink transition-colors"
                />
              </div>

              {/* Location */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                    Location
                  </label>
                  {lowConfidenceFields.includes('location') && (
                    <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                      check this
                    </span>
                  )}
                </div>
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

              {/* Phone with +91 Indian code and NO duplicate prefix or leading 0 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                    Phone
                  </label>
                  {lowConfidenceFields.includes('phone') && (
                    <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                      check this
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <div className="flex items-center px-3 py-2.5 rounded-xl border border-ink-border bg-surface-subtle text-xs font-semibold text-ink shrink-0">
                    <span className="mr-1.5">🇮🇳</span> +91
                  </div>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phoneDigits}
                    onChange={e => {
                      const clean = e.target.value.replace(/^\+91\s*/, '').replace(/^0+/, '');
                      setPhoneDigits(clean);
                    }}
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                    About
                  </label>
                  {lowConfidenceFields.includes('about') && (
                    <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                      check this
                    </span>
                  )}
                </div>
                <textarea
                  rows={4}
                  placeholder="Summary of experience and proof of work..."
                  value={about}
                  onChange={e => setAbout(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-ink text-sm leading-relaxed focus:outline-none focus:border-ink resize-none"
                />
              </div>

              {/* Skills (Removable Chips) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                    Skills ({skills.length}/25)
                  </label>
                  {skills.length === 0 && (
                    <span className="text-[10px] text-ink-muted">Add at least one skill</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 p-3 rounded-2xl border border-ink-border bg-surface-subtle/50 mb-2 min-h-12">
                  {skills.map(skill => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-surface text-ink text-xs font-medium border border-ink-border shadow-xs group"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
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

              {/* Education (Dynamic) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                  Education
                </label>
                {education.length > 0 ? (
                  <div className="p-3.5 rounded-2xl border border-ink-border bg-surface text-xs text-ink space-y-2">
                    {education.map((edu, idx) => (
                      <div key={idx} className="pb-1 border-b border-ink-border/50 last:border-none last:pb-0">
                        <div className="font-semibold text-ink">{edu.degree}</div>
                        <div className="text-ink-muted">{edu.institution} {edu.year ? `(${edu.year})` : ''}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-ink-border/50 bg-surface-subtle text-xs text-ink-muted">
                    No degree specified in resume. You can add one anytime in profile settings.
                  </div>
                )}
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
                      placeholder="https://yoursite.com"
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

      {/* Overwrite Confirmation Modal (as required by Rule 6 & docs/05 section 2) */}
      {showOverwriteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-surface rounded-3xl p-6 shadow-float border border-ink-border space-y-4">
            <div className="flex items-center space-x-3 text-ink">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base">Replace your profile with this resume?</h3>
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              You already have profile details entered. Uploading <strong className="text-ink">{pendingFile?.name}</strong> will overwrite previously parsed fields with the newly extracted data.
            </p>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={cancelOverwrite}
                className="px-4 py-2 rounded-full text-xs font-semibold text-ink-muted hover:text-ink hover:bg-surface-subtle transition-all"
              >
                Keep Existing Profile
              </button>
              <button
                type="button"
                onClick={confirmOverwrite}
                className="px-5 py-2.5 rounded-full bg-ink text-white text-xs font-semibold hover:bg-ink/90 shadow-soft transition-all"
              >
                Yes, Replace Profile
              </button>
            </div>
          </div>
        </div>
      )}
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
