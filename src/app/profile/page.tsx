'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Linkedin,
  Github,
  Globe,
  X,
  Check,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useHireRoomStore } from '@/lib/store';
import { PhoneInputField } from '@/components/PhoneInputField';
import { CandidateProfileSchema } from '@/lib/validations';

export default function ProfilePage() {
  const router = useRouter();
  const { candidateProfile, updateCandidateProfile } = useHireRoomStore();

  const [name, setName] = useState(candidateProfile.name || '');
  const [headline, setHeadline] = useState(candidateProfile.headline || '');
  const [location, setLocation] = useState(candidateProfile.location || 'Bengaluru, India');
  const [phone, setPhone] = useState(candidateProfile.phone || '');
  const [experience, setExperience] = useState(candidateProfile.experience || '0-1 years');
  const [availability, setAvailability] = useState(candidateProfile.availability || 'Immediate (within 15 days)');
  const [about, setAbout] = useState(candidateProfile.about || '');
  const [skills, setSkills] = useState<string[]>(candidateProfile.skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState(candidateProfile.linkedinUrl || '');
  const [githubUrl, setGithubUrl] = useState(candidateProfile.githubUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(candidateProfile.portfolioUrl || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const result = CandidateProfileSchema.safeParse({
      name,
      headline,
      location,
      phone,
      experience,
      availability,
      about: about || 'Experienced developer with verified code deliverables.',
      skills,
      targetRoles: candidateProfile.targetRoles?.length ? candidateProfile.targetRoles : ['Full-time employment'],
      linkedinUrl,
      githubUrl,
      portfolioUrl,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const fieldName = issue.path[0] as string;
        fieldErrors[fieldName] = issue.message;
      });
      setValidationErrors(fieldErrors);
      return;
    }

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
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-bg py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs text-ink-muted hover:text-ink font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to dashboard</span>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            Account Details
          </span>
          <h1 className="font-display text-4xl text-ink font-normal tracking-tight mt-1 mb-1">
            Update <span className="italic text-accent">Profile</span>
          </h1>
          <p className="text-sm text-ink-muted">
            Manage your verified proof-of-work, headline, and competencies.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-surface rounded-3xl border border-ink-border p-6 sm:p-8 shadow-card space-y-6">
        {/* Name & Headline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
              Full Name <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (validationErrors.name) setValidationErrors(prev => ({ ...prev, name: undefined }));
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-ink text-sm font-medium focus:outline-none focus:border-ink"
            />
            {validationErrors.name && (
              <p className="text-xs font-medium text-rose-600 mt-1">{validationErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
              Location <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
              <input
                type="text"
                value={location}
                onChange={e => {
                  setLocation(e.target.value);
                  if (validationErrors.location) setValidationErrors(prev => ({ ...prev, location: undefined }));
                }}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-ink text-sm focus:outline-none focus:border-ink"
              />
            </div>
            {validationErrors.location && (
              <p className="text-xs font-medium text-rose-600 mt-1">{validationErrors.location}</p>
            )}
          </div>
        </div>

        {/* Phone & Headline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
              Headline <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              value={headline}
              onChange={e => {
                setHeadline(e.target.value);
                if (validationErrors.headline) setValidationErrors(prev => ({ ...prev, headline: undefined }));
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-ink text-sm focus:outline-none focus:border-ink"
            />
            {validationErrors.headline && (
              <p className="text-xs font-medium text-rose-600 mt-1">{validationErrors.headline}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
              Phone Number <span className="text-accent">*</span>
            </label>
            <PhoneInputField
              value={phone}
              onChange={e164Val => {
                setPhone(e164Val);
                if (validationErrors.phone) setValidationErrors(prev => ({ ...prev, phone: undefined }));
              }}
              error={validationErrors.phone}
            />
          </div>
        </div>

        {/* About */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
            About You
          </label>
          <textarea
            rows={4}
            value={about}
            onChange={e => setAbout(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-ink-border bg-surface text-ink text-sm leading-relaxed focus:outline-none focus:border-ink resize-none"
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
            Skills
          </label>
          <div className="flex flex-wrap gap-2 p-3 rounded-2xl border border-ink-border bg-surface-subtle/50 mb-2">
            {skills.map(skill => (
              <span
                key={skill}
                className="inline-flex items-center px-3 py-1 rounded-full bg-surface text-ink text-xs font-medium border border-ink-border shadow-xs"
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
            className="w-full px-3.5 py-2 rounded-xl border border-ink-border bg-surface text-xs text-ink focus:outline-none focus:border-ink"
          />
        </div>

        {/* Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <Linkedin className="w-4 h-4 text-ink-muted mr-3 shrink-0" />
            <input
              type="url"
              value={linkedinUrl}
              onChange={e => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full text-xs text-ink focus:outline-none bg-transparent"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between">
          <button
            type="submit"
            className="inline-flex items-center space-x-2 px-8 py-3 bg-ink text-white rounded-full text-xs font-semibold hover:bg-ink/90 shadow-soft transition-all"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
