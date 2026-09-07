export const ROLES = {
  JOB_SEEKER: "job_seeker",
  EMPLOYER: "employer",
  ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const USER_STATUSES = ["active", "inactive", "suspended"] as const;

export const VERIFICATION_STATUSES = ["pending", "verified", "rejected"] as const;

export const EMPLOYMENT_TYPES = [
  "full-time",
  "part-time",
  "contract",
  "internship",
] as const;

export const SKILL_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
] as const;

export const JOB_STATUSES = ["draft", "active", "closed"] as const;

export const APPLICATION_STATUSES = [
  "applied",
  "shortlisted",
  "interview",
  "offered",
  "rejected",
  "hired",
] as const;

export const APPLICATION_PIPELINE = [
  "applied",
  "shortlisted",
  "interview",
  "offered",
  "hired",
] as const;

export const INTERVIEW_STATUSES = [
  "scheduled",
  "completed",
  "cancelled",
  "rescheduled",
] as const;

export const NOTIFICATION_TYPES = {
  APPLICATION_SUBMITTED: "application_submitted",
  APPLICATION_STATUS: "application_status",
  APPLICANT_SHORTLISTED: "applicant_shortlisted",
  INTERVIEW_SCHEDULED: "interview_scheduled",
  INTERVIEW_RESCHEDULED: "interview_rescheduled",
  INTERVIEW_CANCELLED: "interview_cancelled",
  JOB_RECOMMENDATION: "job_recommendation",
  EMPLOYER_VERIFICATION: "employer_verification",
  NEW_MESSAGE: "new_message",
  SYSTEM: "system",
} as const;

export const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const ALLOWED_RESUME_EXTENSIONS = [".pdf", ".doc", ".docx"];

export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
];
