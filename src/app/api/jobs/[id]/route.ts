import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, requireApiSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { jobPostingSchema } from "@/lib/validations";
import { formatPesoRange } from "@/lib/utils";
import { getSetting } from "@/lib/matching-service";
import { syncJobSkills } from "@/lib/skills";
import { matchSeekerToJob } from "@/lib/matching-service";
import { calculateMatchScore } from "@/lib/matching";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const jobId = Number(id);
  const job = await prisma.jobPosting.findUnique({
    where: { job_id: jobId },
    include: {
      employer: { include: { companyProfile: true, user: true } },
      jobSkills: { include: { skill: true } },
    },
  });
  if (!job) {
    return NextResponse.json({ error: "Job posting not found." }, { status: 404 });
  }

  let match = null;
  const sessionUser = await getSessionUser();
  if (sessionUser?.role === ROLES.JOB_SEEKER) {
    const seeker = await prisma.jobSeeker.findUnique({
      where: { user_id: Number(sessionUser.id) },
      include: { seekerSkills: { include: { skill: true } } },
    });
    if (seeker) {
      match = calculateMatchScore({
        candidateSkills: seeker.seekerSkills.map((s) => s.skill.skill_name),
        requiredSkills: job.jobSkills.map((s) => s.skill.skill_name),
      });
      await matchSeekerToJob(seeker.seeker_id, job.job_id);
    }
  }

  return NextResponse.json({
    job: {
      job_id: job.job_id,
      job_title: job.job_title,
      job_description: job.job_description,
      location: job.location,
      employment_type: job.employment_type,
      salary_range: formatPesoRange(job.salary_min, job.salary_max, job.salary_range),
      status: job.status,
      posted_at: job.posted_at,
      deadline: job.deadline,
      company: {
        name: job.employer.company_name,
        location: job.employer.company_location,
        industry: job.employer.industry,
        verified: job.employer.verification_status === "verified",
      },
      skills: job.jobSkills.map((js) => ({
        name: js.skill.skill_name,
        level: js.required_level,
      })),
      match,
    },
  });
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const gate = await requireApiSession([ROLES.EMPLOYER, ROLES.ADMIN]);
  if ("error" in gate && gate.error) return gate.error;
  const { id } = await context.params;
  const jobId = Number(id);

  const job = await prisma.jobPosting.findUnique({ where: { job_id: jobId } });
  if (!job) return NextResponse.json({ error: "Job posting not found." }, { status: 404 });

  if (gate.user!.role === ROLES.EMPLOYER) {
    const employer = await prisma.employer.findUnique({
      where: { user_id: Number(gate.user!.id) },
    });
    if (!employer || employer.employer_id !== job.employer_id) {
      return NextResponse.json(
        { error: "You can only manage your own job postings." },
        { status: 403 },
      );
    }
  }

  const body = await req.json();
  if (body.status && ["active", "closed", "draft"].includes(body.status) && !body.job_title) {
    if (body.status === "active") {
      const requireVerify = (await getSetting("require_employer_verification", "true")) === "true";
      const employer = await prisma.employer.findUnique({ where: { employer_id: job.employer_id } });
      if (requireVerify && employer?.verification_status !== "verified") {
        return NextResponse.json(
          { error: "Verified employers only can publish jobs." },
          { status: 403 },
        );
      }
    }
    const updated = await prisma.jobPosting.update({
      where: { job_id: jobId },
      data: { status: body.status, closed_reason: body.closed_reason ?? null },
    });
    return NextResponse.json({ job: updated });
  }

  const parsed = jobPostingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid job details." },
      { status: 400 },
    );
  }

  await prisma.jobPosting.update({
    where: { job_id: jobId },
    data: {
      job_title: parsed.data.job_title,
      job_description: parsed.data.job_description,
      location: parsed.data.location,
      employment_type: parsed.data.employment_type,
      salary_min: parsed.data.salary_min,
      salary_max: parsed.data.salary_max,
      salary_range: formatPesoRange(parsed.data.salary_min, parsed.data.salary_max, null),
      deadline: new Date(parsed.data.deadline),
      status: parsed.data.status,
    },
  });
  await syncJobSkills(jobId, parsed.data.skills);
  return NextResponse.json({ ok: true });
}
