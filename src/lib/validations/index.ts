import { z } from 'zod';
import { normalizePhoneNumber } from '@/lib/phone';

/**
 * Reusable Zod Validation Schemas (Prompt R3)
 * Strict validation with clear, actionable error messages
 */

export const CandidateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().refine(val => normalizePhoneNumber(val).isValid, {
    message: 'Please enter a valid phone number (validated with libphonenumber-js)',
  }),
  headline: z.string().min(3, 'Headline must be at least 3 characters'),
  location: z.string().min(2, 'Location is required'),
  experience: z.string().min(1, 'Experience is required'),
  availability: z.string().min(1, 'Availability is required'),
  about: z.string().min(10, 'About section must be at least 10 characters'),
  skills: z.array(z.string()).min(1, 'Please add at least 1 skill'),
  targetRoles: z.array(z.string()).min(1, 'Please select at least 1 target role'),
  linkedinUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export const CompanyOnboardingSchema = z.object({
  website: z.string().min(3, 'Website is required'),
  name: z.string().min(2, 'Company name is required'),
  oneLiner: z.string().min(10, 'Please provide a descriptive one-line summary'),
  city: z.string().min(2, 'City is required'),
  isRemote: z.boolean().default(false),
  size: z.enum(['1-10', '11-50', '51-200', '200+']),
});

export const PostListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  type: z.enum(['job', 'internship', 'challenge']),
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  pay: z.string().min(2, 'Compensation / Prize is required'),
  location: z.string().min(2, 'Location is required'),
  isRemote: z.boolean().default(false),
  skills: z.array(z.string()).min(1, 'Please add at least 1 skill'),
  deadline: z.string().min(3, 'Deadline is required'),
});

export const ChallengeSubmissionSchema = z.object({
  demoUrl: z.string().url('Must be a valid live demo URL').optional().or(z.literal('')),
  repoUrl: z.string().url('Must be a valid repository URL').optional().or(z.literal('')),
  videoUrl: z.string().url('Must be a valid walkthrough video URL (Loom or YouTube)').optional().or(z.literal('')),
  notes: z.string().optional(),
});
