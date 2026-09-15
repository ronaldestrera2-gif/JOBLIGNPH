import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { ROLES, NOTIFICATION_TYPES } from "@/lib/constants";
import { applicationSchema } from "@/lib/validations";
import { isExpired } from "@/lib/utils";
import { notifyUser } from "@/lib/notifications";
import { matchSeekerToJob } from "@/lib/matching-service";

export async function GET(req: NextRequest) {
  try {
    const gate = await requireApiSession();
    if ("error" in gate && gate.error) return gate.error;

    const userId = Number(gate.user!.id);
    const jobId = req.nextUrl.searchParams.get("job_id");

    if (gate.user!.role === ROLES.JOB_SEEKER) {
      const seeker = await prisma.jobSeeker.findUnique({
        where: { user_id: userId },
      });
      if (!seeker) return NextResponse.json({ applications: [] });

      const applications = await prisma.application.findMany({
        where: { seeker_id: seeker.seeker_id },
        include: {
          jobPosting: { include: { employer: true } },
          interviews: true,
        },
        orderBy: { applied_at: "desc" },
      });

      return NextResponse.json({ applications });
    }

    if (gate.user!.role === ROLES.EMPLOYER) {
      const employer = await prisma.employer.findUnique({
        where: { user_id: userId },
      });
      if (!employer) return NextResponse.json({ applications: [] });

      const applications = await prisma.application.findMany({
        where: {
          jobPosting: { employer_id: employer.employer_id },
          ...(jobId ? { job_id: Number(jobId) } : {}),
        },
        include: {
          jobSeeker: {
            include: {
              user: true,
              seekerSkills: { include: { skill: true } },
            },
          },
          jobPosting: true,
          resume: true,
        },
        orderBy: { applied_at: "desc" },
      });

      return NextResponse.json({ applications });
    }

    const applications = await prisma.application.findMany({
      include: {
        jobSeeker: { include: { user: true } },
        jobPosting: { include: { employer: true } },
      },
      orderBy: { applied_at: "desc" },
      take: 200,
    });

    return NextResponse.json({ applications });
  } catch (error: any) {
    console.error("GET /api/applications error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load applications." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const gate = await requireApiSession([ROLES.JOB_SEEKER]);
    if ("error" in gate && gate.error) return gate.error;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const parsed = applicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ?? "Invalid application.",
        },
        { status: 400 }
      );
    }

    if (!parsed.data.resume_id) {
      return NextResponse.json(
        { error: "Please select one of your uploaded resumes." },
        { status: 400 }
      );
    }

    const seeker = await prisma.jobSeeker.findUnique({
      where: { user_id: Number(gate.user!.id) },
      include: { user: true },
    });

    if (!seeker) {
      return NextResponse.json(
        { error: "Job seeker profile not found." },
        { status: 404 }
      );
    }

    const job = await prisma.jobPosting.findUnique({
      where: { job_id: parsed.data.job_id },
      include: { employer: { include: { user: true } } },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job posting not found." },
        { status: 404 }
      );
    }

    if (job.status !== "active" || isExpired(job.deadline)) {
      return NextResponse.json(
        {
          error:
            "Applications cannot be submitted to closed or expired job postings.",
        },
        { status: 400 }
      );
    }

    const resume = await prisma.resume.findFirst({
      where: {
        resume_id: parsed.data.resume_id,
        seeker_id: seeker.seeker_id,
      },
    });

    if (!resume) {
      return NextResponse.json(
        { error: "Please select one of your uploaded resumes." },
        { status: 400 }
      );
    }

    const existing = await prisma.application.findFirst({
      where: {
        seeker_id: seeker.seeker_id,
        job_id: job.job_id,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already applied to this job." },
        { status: 409 }
      );
    }

    const application = await prisma.application.create({
      data: {
        seeker_id: seeker.seeker_id,
        job_id: job.job_id,
        resume_id: resume.resume_id,
        cover_letter: parsed.data.cover_letter || null,
        status: "applied",
      },
    });

    // non-blocking side effects
    try {
      await matchSeekerToJob(seeker.seeker_id, job.job_id);
    } catch (e) {
      console.error("matchSeekerToJob failed:", e);
    }

    try {
      await notifyUser({
        userId: seeker.user_id,
        title: "Application submitted",
        message: `Your application for ${job.job_title} at ${job.employer.company_name} was submitted.`,
        type: NOTIFICATION_TYPES.APPLICATION_SUBMITTED,
      });

      await notifyUser({
        userId: job.employer.user_id,
        title: "New applicant",
        message: `${seeker.user.first_name} ${seeker.user.last_name} applied for ${job.job_title}.`,
        type: NOTIFICATION_TYPES.APPLICATION_SUBMITTED,
      });
    } catch (e) {
      console.error("notifyUser failed:", e);
    }

    return NextResponse.json(
      { application_id: application.application_id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/applications error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Server error while submitting application.",
      },
      { status: 500 }
    );
  }
}