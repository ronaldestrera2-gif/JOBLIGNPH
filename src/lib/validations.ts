import { z } from "zod";
import {
  APPLICATION_STATUSES,
  EMPLOYMENT_TYPES,
  INTERVIEW_STATUSES,
  JOB_STATUSES,
  ROLES,
  SKILL_LEVELS,
  USER_STATUSES,
} from "./constants";

export const passwordSchema = z
  .string()
  .min(8, { error: "Password must be at least 8 characters long." })
  .regex(/[A-Za-z]/, { error: "Password must contain at least one letter." })
  .regex(/[0-9]/, { error: "Password must contain at least one number." });

export const registerSchema = z.object({
  first_name: z.string().trim().min(1, { error: "First name is required." }),
  last_name: z.string().trim().min(1, { error: "Last name is required." }),
  email: z.email({ error: "Please enter a valid email address." }),
  password: passwordSchema,
  role: z.enum([ROLES.JOB_SEEKER, ROLES.EMPLOYER]),
  company_name: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: z.email({ error: "Please enter a valid email address." }),
  password: z.string().min(1, { error: "Password is required." }),
});

export const seekerProfileSchema = z.object({
  first_name: z.string().trim().min(1),
  last_name: z.string().trim().min(1),
  headline: z.string().trim().max(160).optional().or(z.literal("")),
  education: z.string().trim().optional().or(z.literal("")),
  work_experience: z.string().trim().optional().or(z.literal("")),
  experience_years: z.coerce.number().int().min(0).max(60).optional(),
  location: z.string().trim().optional().or(z.literal("")),
  employment_type_preference: z
    .enum(EMPLOYMENT_TYPES)
    .optional()
    .or(z.literal("")),
  availability: z.string().trim().optional().or(z.literal("")),
  certifications: z.string().trim().optional().or(z.literal("")),
  other_qualifications: z.string().trim().optional().or(z.literal("")),
  skills: z.array(z.string().trim().min(1)).default([]),
});

export const employerProfileSchema = z.object({
  company_name: z.string().trim().min(1, { error: "Company name is required." }),
  company_description: z.string().trim().optional().or(z.literal("")),
  company_location: z.string().trim().optional().or(z.literal("")),
  industry: z.string().trim().optional().or(z.literal("")),
  contact_number: z.string().trim().optional().or(z.literal("")),
  website: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^https?:\/\//i.test(v),
      { error: "Website must start with http:// or https://." },
    ),
  company_size: z.string().trim().optional().or(z.literal("")),
});

export const jobPostingSchema = z
  .object({
    job_title: z.string().trim().min(2, { error: "Job title is required." }),
    job_description: z
      .string()
      .trim()
      .min(20, { error: "Please provide a more detailed job description." }),
    location: z.string().trim().min(1, { error: "Location is required." }),
    employment_type: z.enum(EMPLOYMENT_TYPES),
    salary_min: z.coerce.number().int().min(0).optional(),
    salary_max: z.coerce.number().int().min(0).optional(),
    deadline: z.string().min(1, { error: "Application deadline is required." }),
    status: z.enum(JOB_STATUSES).default("draft"),
    skills: z
      .array(
        z.object({
          skill_name: z.string().trim().min(1),
          required_level: z.enum(SKILL_LEVELS).default("intermediate"),
        }),
      )
      .min(1, { error: "At least one required skill is needed." }),
  })
  .refine(
    (data) =>
      data.salary_min === undefined ||
      data.salary_max === undefined ||
      data.salary_min <= data.salary_max,
    { error: "Minimum salary cannot be greater than maximum salary." },
  );

export const applicationSchema = z.object({
  job_id: z.coerce.number().int().positive(),
  resume_id: z.coerce.number().int().positive(),
  cover_letter: z
    .string()
    .trim()
    .min(20, { error: "Please write a short cover letter (at least 20 characters)." }),
});

export const applicationStatusSchema = z.object({
  status: z.enum(APPLICATION_STATUSES),
});

export const interviewSchema = z.object({
  application_id: z.coerce.number().int().positive(),
  interview_date: z.string().min(1, { error: "Interview date is required." }),
  interview_time: z.string().min(1, { error: "Interview time is required." }),
  location: z.string().trim().min(1, { error: "Location or platform is required." }),
  notes: z.string().trim().optional().or(z.literal("")),
  status: z.enum(INTERVIEW_STATUSES).default("scheduled"),
});

export const messageSchema = z.object({
  body: z.string().trim().min(1, { error: "Message cannot be empty." }).max(4000),
});

export const userStatusSchema = z.object({
  status: z.enum(USER_STATUSES),
});

export const verificationSchema = z.object({
  verification_status: z.enum(["verified", "rejected"]),
  notes: z.string().trim().optional().or(z.literal("")),
});

export const settingsSchema = z.object({
  require_employer_verification: z.enum(["true", "false"]),
  platform_name: z.string().trim().min(1).optional(),
});
