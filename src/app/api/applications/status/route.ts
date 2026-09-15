import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";

const employerAllowed: Record<string, string[]> = {
  applied: ["interview", "rejected"],
  interview: ["hired", "rejected"],
};

export async function PATCH(req: Request) {
  const gate = await requireApiSession([ROLES.EMPLOYER, ROLES.JOB_SEEKER]);
  if ("error" in gate && gate.error) return gate.error;

  const body = await req.json();
  const applicationId = Number(body.application_id);
  const nextStatus = String(body.status || "");

  const application = await prisma.application.findUnique({
    where: { application_id: applicationId },
    include: {
      jobPosting: true,
      jobSeeker: true,
    },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  const role = gate.user!.role;
  const userId = Number(gate.user!.id);

  // Job Seeker can cancel if Applied or Interview
  if (role === ROLES.JOB_SEEKER) {
    if (application.jobSeeker.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const canCancel =
      (application.status === "applied" || application.status === "interview") &&
      nextStatus === "cancelled";

    if (!canCancel) {
      return NextResponse.json(
        { error: "You can only cancel an application that is Applied or Interview." },
        { status: 400 }
      );
    }
  }

  // Employer flow
  if (role === ROLES.EMPLOYER) {
    const employer = await prisma.employer.findUnique({
      where: { user_id: userId },
    });

    if (!employer || application.jobPosting.employer_id !== employer.employer_id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const allowed = employerAllowed[application.status] || [];
    if (!allowed.includes(nextStatus)) {
      return NextResponse.json(
        { error: "Invalid status transition." },
        { status: 400 }
      );
    }
  }

  await prisma.application.update({
    where: { application_id: applicationId },
    data: { status: nextStatus },
  });

  return NextResponse.json({ ok: true });
}