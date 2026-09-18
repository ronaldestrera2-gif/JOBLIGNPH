import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { ROLES, NOTIFICATION_TYPES } from "@/lib/constants";
import { notifyUser } from "@/lib/notifications";

const ALLOWED_STATUSES = [
  "applied",
  "interview",
  "hired",
  "rejected",
  "cancelled",
] as const;

type AppStatus = (typeof ALLOWED_STATUSES)[number];

function isAllowedStatus(value: string): value is AppStatus {
  return (ALLOWED_STATUSES as readonly string[]).includes(value);
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const gate = await requireApiSession();
    if ("error" in gate && gate.error) return gate.error;

    const { id } = await context.params;
    const applicationId = Number(id);

    const application = await prisma.application.findUnique({
      where: { application_id: applicationId },
      include: {
        jobPosting: { include: { employer: true } },
        jobSeeker: { include: { user: true } },
        resume: true,
        interviews: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const userId = Number(gate.user!.id);
    const role = gate.user!.role;

    if (role === ROLES.JOB_SEEKER) {
      if (application.jobSeeker.user_id !== userId) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
      }
    } else if (role === ROLES.EMPLOYER) {
      const employer = await prisma.employer.findUnique({
        where: { user_id: userId },
      });
      if (!employer || application.jobPosting.employer_id !== employer.employer_id) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
      }
    } else if (role !== ROLES.ADMIN) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    return NextResponse.json({ application });
  } catch (error: any) {
    console.error("GET application error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load application." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const gate = await requireApiSession();
    if ("error" in gate && gate.error) return gate.error;

    const { id } = await context.params;
    const applicationId = Number(id);

    const body = await req.json();
    const nextStatus = String(body.status || "");

    if (!isAllowedStatus(nextStatus)) {
      return NextResponse.json(
        {
          error:
            "Invalid status. Allowed: applied, interview, hired, rejected, cancelled.",
        },
        { status: 400 },
      );
    }

    const application = await prisma.application.findUnique({
      where: { application_id: applicationId },
      include: {
        jobPosting: { include: { employer: { include: { user: true } } } },
        jobSeeker: { include: { user: true } },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const userId = Number(gate.user!.id);
    const role = gate.user!.role;
    const current = application.status as AppStatus;

    // Permissions
    if (role === ROLES.JOB_SEEKER) {
      if (application.jobSeeker.user_id !== userId) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
      }
      // Seeker can only cancel applied/interview
      if (nextStatus !== "cancelled") {
        return NextResponse.json(
          { error: "Job seekers can only cancel applications." },
          { status: 403 },
        );
      }
      if (current !== "applied" && current !== "interview") {
        return NextResponse.json(
          { error: "Only applied or interview applications can be cancelled." },
          { status: 400 },
        );
      }
    } else if (role === ROLES.EMPLOYER) {
      const employer = await prisma.employer.findUnique({
        where: { user_id: userId },
      });
      if (!employer || application.jobPosting.employer_id !== employer.employer_id) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
      }

      
      
      
      if (current === "applied") {
        if (nextStatus !== "interview" && nextStatus !== "rejected") {
          return NextResponse.json(
            { error: "From applied, choose Interview or Reject." },
            { status: 400 },
          );
        }
      } else if (current === "interview") {
        if (nextStatus !== "hired" && nextStatus !== "rejected") {
          return NextResponse.json(
            { error: "From interview, choose Hired or Reject." },
            { status: 400 },
          );
        }
      } else {
        return NextResponse.json(
          { error: "This application can no longer be updated." },
          { status: 400 },
        );
      }
    } else if (role !== ROLES.ADMIN) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const updated = await prisma.application.update({
      where: { application_id: applicationId },
      data: { status: nextStatus },
    });

    
    try {
      if (role === ROLES.EMPLOYER || role === ROLES.ADMIN) {
        await notifyUser({
          userId: application.jobSeeker.user_id,
          title: "Application status updated",
          message: `Your application for ${application.jobPosting.job_title} is now ${nextStatus}.`,
          type: NOTIFICATION_TYPES.APPLICATION_SUBMITTED,
        });
      }

      if (role === ROLES.JOB_SEEKER && nextStatus === "cancelled") {
        await notifyUser({
          userId: application.jobPosting.employer.user_id,
          title: "Application cancelled",
          message: `${application.jobSeeker.user.first_name} ${application.jobSeeker.user.last_name} cancelled their application for ${application.jobPosting.job_title}.`,
          type: NOTIFICATION_TYPES.APPLICATION_SUBMITTED,
        });
      }
    } catch (e) {
      console.error("Notification failed:", e);
    }

    return NextResponse.json({ application: updated });
  } catch (error: any) {
    console.error("PATCH application error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update application." },
      { status: 500 },
    );
  }
}