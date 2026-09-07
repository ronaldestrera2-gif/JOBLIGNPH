import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { APPLICATION_STATUSES, NOTIFICATION_TYPES, ROLES } from "@/lib/constants";
import { applicationStatusSchema } from "@/lib/validations";
import { notifyUser } from "@/lib/notifications";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const gate = await requireApiSession([ROLES.EMPLOYER, ROLES.ADMIN]);
  if ("error" in gate && gate.error) return gate.error;
  const { id } = await context.params;
  const parsed = applicationStatusSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid application status." }, { status: 400 });
  }
  if (!APPLICATION_STATUSES.includes(parsed.data.status)) {
    return NextResponse.json({ error: "Invalid application status." }, { status: 400 });
  }

  const application = await prisma.application.findUnique({
    where: { application_id: Number(id) },
    include: {
      jobPosting: { include: { employer: true } },
      jobSeeker: { include: { user: true } },
    },
  });
  if (!application) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  if (gate.user!.role === ROLES.EMPLOYER) {
    const employer = await prisma.employer.findUnique({
      where: { user_id: Number(gate.user!.id) },
    });
    if (!employer || employer.employer_id !== application.jobPosting.employer_id) {
      return NextResponse.json(
        { error: "You can only manage applications for your own job postings." },
        { status: 403 },
      );
    }
  }

  const updated = await prisma.application.update({
    where: { application_id: application.application_id },
    data: { status: parsed.data.status },
  });

  const type =
    parsed.data.status === "shortlisted"
      ? NOTIFICATION_TYPES.APPLICANT_SHORTLISTED
      : NOTIFICATION_TYPES.APPLICATION_STATUS;

  await notifyUser({
    userId: application.jobSeeker.user_id,
    title: "Application status updated",
    message: `Your application for ${application.jobPosting.job_title} is now: ${parsed.data.status}.`,
    type,
  });

  return NextResponse.json({ application: updated });
}
