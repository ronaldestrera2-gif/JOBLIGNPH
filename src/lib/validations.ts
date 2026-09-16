import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password must include a letter")
  .regex(/[0-9]/, "Password must include a number");

export const registerSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Enter a valid email"),
    password: passwordSchema,
    role: z.enum(["job_seeker", "employer"]),
    company_name: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "employer" && !data.company_name?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Company name is required for employers",
        path: ["company_name"],
      });
    }
  });

export const seekerProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  headline: z.string().optional().nullable(),
  education: z.string().optional().nullable(),
  work_experience: z.string().optional().nullable(),
  experience_years: z.number().int().min(0).optional().nullable(),
  location: z.string().optional().nullable(),
  employment_type_preference: z.string().optional().nullable(),
  availability: z.string().optional().nullable(),
  certifications: z.string().optional().nullable(),
  other_qualifications: z.string().optional().nullable(),
  skills: z.array(z.string()).default([]),
});

export const employerProfileSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  company_description: z.string().optional().nullable(),
  company_location: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  contact_number: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  company_size: z.string().optional().nullable(),
});

export const jobPostingSchema = z.object({
  job_title: z.string().min(1, "Job title is required"),
  job_description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  employment_type: z.string().min(1, "Employment type is required"),
  salary_min: z.number().int().min(0).optional().nullable(),
  salary_max: z.number().int().min(0).optional().nullable(),
  salary_period: z.enum(["monthly", "weekly"]).optional().nullable(),
  deadline: z.string().optional().nullable(),
  status: z.enum(["draft", "active", "closed"]).optional(),
  skills: z.array(z.string()).default([]),
});

export const applicationSchema = z.object({
  job_id: z.coerce.number().int().positive("Job is required"),
  resume_id: z.coerce.number().int().positive("Please select a resume"),
  cover_letter: z.string().optional().nullable(),
});

export const applicationStatusSchema = z.object({
  application_id: z.coerce.number().int().positive(),
  status: z.enum([
    "applied",
    "shortlisted",
    "interview",
    "offered",
    "hired",
    "rejected",
    "cancelled",
  ]),
});

// Used by admin employer verify route
export const verificationSchema = z.object({
  verification_status: z.enum(["verified", "rejected", "pending"]),
  notes: z.string().optional().nullable(),
  // keep compatibility if some code uses status
  status: z.enum(["verified", "rejected", "pending"]).optional(),
});

export const interviewSchema = z.object({
  application_id: z.coerce.number().int().positive(),
  interview_date: z.string().min(1, "Interview date is required"),
  interview_time: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z
    .enum(["scheduled", "completed", "cancelled", "rescheduled"])
    .optional(),
});

export const interviewUpdateSchema = z.object({
  interview_date: z.string().optional().nullable(),
  interview_time: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z
    .enum(["scheduled", "completed", "cancelled", "rescheduled"])
    .optional(),
});

export const messageSchema = z.object({
  body: z.string().min(1, "Message is required"),
});

export const conversationSchema = z.object({
  job_id: z.coerce.number().int().positive().optional().nullable(),
  participant_user_id: z.coerce.number().int().positive(),
  body: z.string().min(1).optional(),
});

export const settingsSchema = z.object({
  require_employer_verification: z.union([z.boolean(), z.string()]).optional(),
  platform_name: z.string().optional(),
  setting_key: z.string().optional(),
  setting_value: z.string().optional(),
});

export const userStatusSchema = z.object({
  user_id: z.coerce.number().int().positive(),
  status: z.enum(["active", "inactive", "suspended", "banned"]),
});