import { z } from 'zod';
import type { Database } from '@/lib/supabase.types';

// Raw type from database
export type CandidateProfile = Database['public']['Tables']['candidate_profiles']['Row'];

// Shape for creating/updating
export type CandidateProfileUpdate = Pick<
  CandidateProfile,
  'name' | 'phone' | 'title' | 'experience_years' | 'skills' | 'bio' | 'location'
>;

// Zod schema for form validation
export const candidateProfileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 characters')
    .max(20, 'Phone number must be less than 20 characters')
    .optional()
    .nullable(),
  title: z.string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must be less than 100 characters')
    .optional()
    .nullable(),
  experience_years: z.number()
    .min(0, 'Experience years cannot be negative')
    .max(50, 'Experience years must be less than 50')
    .optional()
    .nullable(),
  skills: z.array(z.string())
    .default([])
    .transform((skills: string[]) => skills.map((s: string) => s.trim()).filter(Boolean)),
  bio: z.string()
    .max(1000, 'Bio must be less than 1000 characters')
    .optional()
    .nullable(),
  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .optional()
    .nullable(),
});

// Type inferred from the schema
export type CandidateProfileForm = z.infer<typeof candidateProfileSchema>;

// Helper to validate form data
export const validateCandidateProfile = (data: unknown) => {
  return candidateProfileSchema.parse(data);
}; 