import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { jobPostingSchema } from "@/lib/validations";
import { isExpired } from "@/lib/utils";
import { getSetting } from "@/lib/matching-service";
import { syncJobSkills } from "@/lib/skills";
import { Prisma } from "@prisma/client";

function jobWhere(search: URLSearchParams): Prisma.JobPostingWhereInput {
  const keyword = search.get("q")?.trim();
  const title = search.get("title")?.trim();
  const location = search.get("location")?.trim();
  const employment_type = search.get("employment_type")?.trim();
  const skill = search.get("skill")?.trim();
  const status = search.get("status")?.trim();
  const salary_min = search.get("salary_min");
  const deadline = search.get("deadline");

  const where: Prisma.JobPostingWhereInput = {
    status: status || "active",
  };

  if (keyword) {
    where.OR = [
      { job_title: { contains: keyword } },
      { job_description: { contains: keyword } },
      { location: { contains: keyword } },
    ];
  }
  if (title) where.job_title = { contains: title };
  if (location) where.location = { contains: location };
  if (employment_type) where.employment_type = employment_type;
  if (skill) {
    where.jobSkills = {
      some: { skill: { skill_name: { contains: skill } } },
    };
  }
  if (salary_min) where.salary_min = { gte: Number(salary_min) };
  if (deadline) where.deadline = { lte: new Date(deadline) };

  return where;
}

function statusFilter<T extends { status: string; deadline: Date | null }>(
  search: URLSearchParams,
  all: T[],
  open: T[],
) {
  const status = search.get("status");
  if (status) return all;
  return open.length ? open : all.filter((j) => j.status === "active");
}

function formatSalaryDisplay(
  salaryMin: number | null,
  salaryPeriod: string | null,
) {
  if (!salaryMin) return "Salary not specified";
  const period =
    salaryPeriod === "weekly"
      ? "per week"
      : salaryPeriod === "monthly"
        ? "per month"
        : salaryPeriod || "";
  return `₱${salaryMin.toLocaleString()}${period ? ` ${period}` : ""}`;
}

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams;
  const where = jobWhere(search);
  const sort = search.get("sort") || "date";

  const jobs = await prisma.jobPosting.findMany({
    where,
    include: {
      employer: { include: { companyProfile: true } },
      jobSkills: { include: { skill: true } },
    },
    orderBy: sort === "deadline" ? { deadline: "asc" } : { posted_at: "desc" },
  });

  const openJobs = jobs.filter(
    (job) => job.status === "active" && !isExpired(job.deadline),
  );

  return NextResponse.json({
    jobs: statusFilter(search, jobs, openJobs).map((job) => ({
      job_id: job.job_id,
      job_title: job.job_title,
      job_description: job.job_description,
      location: job.location,
      employment_type: job.employment_type,
      salary_range: formatSalaryDisplay(job.salary_min, job.salary_range),
      status: job.status,
      posted_at: job.posted_at,
      deadline: job.deadline,
      company: job.employer.company_name,
      skills: job.jobSkills.map((js) => ({
        name: js.skill.skill_name,
        level: js.required_level,
      })),
    })),
  });
}

export async function POST(req: Request) {
  try {
    const gate = await requireApiSession([ROLES.EMPLOYER]);
    if ("error" in gate && gate.error) return gate.error;

    const userId = Number(gate.user!.id);
    const employer = await prisma.employer.findUnique({
      where: { user_id: userId },
    });

    if (!employer) {
      return NextResponse.json(
        { error: "Employer profile not found." },
        { status: 404 },
      );
    }

    const requireVerify =
      (await getSetting("require_employer_verification", "true")) === "true";

    const body = await req.json();

    const status = String(body.status || "active");
    if (status !== "active" && status !== "draft") {
      return NextResponse.json(
        { error: "Status must be Active or Draft only." },
        { status: 400 },
      );
    }

    const salaryPeriod = String(body.salary_period || "monthly");
    if (salaryPeriod !== "monthly" && salaryPeriod !== "weekly") {
      return NextResponse.json(
        { error: "Salary period must be monthly or weekly." },
        { status: 400 },
      );
    }

    const cleanedSkills = (Array.isArray(body.skills) ? body.skills : [])
      .map((s: unknown) => (typeof s === "string" ? s.trim() : ""))
      .filter(Boolean);

    const parsed = jobPostingSchema.safeParse({
      ...body,
      status,
      salary_max: null,
      salary_min:
        body.salary_min === "" || body.salary_min == null
          ? null
          : Number(body.salary_min),
      deadline: body.deadline || null,
      skills: cleanedSkills,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid job details.",
        },
        { status: 400 },
      );
    }

    if (
      parsed.data.status === "active" &&
      requireVerify &&
      employer.verification_status !== "verified"
    ) {
      return NextResponse.json(
        { error: "Your company must be verified before publishing jobs." },
        { status: 403 },
      );
    }

    const job = await prisma.jobPosting.create({
      data: {
        employer_id: employer.employer_id,
        job_title: parsed.data.job_title,
        job_description: parsed.data.job_description,
        location: parsed.data.location,
        employment_type: parsed.data.employment_type,
        salary_min: parsed.data.salary_min ?? null,
        salary_max: null,
        salary_range: salaryPeriod, // monthly | weekly
        deadline: parsed.data.deadline
          ? new Date(parsed.data.deadline)
          : null,
        status: parsed.data.status,
      },
    });

    await syncJobSkills(job.job_id, cleanedSkills);

    return NextResponse.json({ job_id: job.job_id }, { status: 201 });
  } catch (error: any) {
    console.error("Create job error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Server error while creating job.",
        detail: String(error),
      },
      { status: 500 },
    );
  }
}