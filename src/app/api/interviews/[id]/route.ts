import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { NOTIFICATION_TYPES, ROLES } from "@/lib/constants";
import { interviewSchema } from "@/lib/validations";
import { notifyUser } from "@/lib/notifications";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const gate = await requireApiSession([ROLES.EMPLOYER]);
  if ("error" in gate && gate.error) return gate.error;
  const { id } = await context.params;
  const parsed = interviewSchema.partial().safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid interview update." }, { status: 400 });
  }

  const employer = await prisma.employer.findUnique({
    where: { user_id: Number(gate.user!.id) },
  });
  const interview = await prisma.interview.findUnique({
    where: { interview_id: Number(id) },
    include: { application: { include: { jobPosting: true, jobSeeker: true } } },
  });
  if (!interview || interview.application.jobPosting.employer_id !== employer?.employer_id) {
    return NextResponse.json({ error: "Interview not found." }, { status: 404 });
  }

  const updated = await prisma.interview.update({
    where: { interview_id: interview.interview_id },
    data: {
      interview_date: parsed.data.interview_date
        ? new Date(parsed.data.interview_date)
        : undefined,
      interview_time: parsed.data.interview_time,
      location: parsed.data.location,
      notes: parsed.data.notes,
      status: parsed.data.status,
    },
  });

  const type =
    parsed.data.status === "cancelled"
      ? NOTIFICATION_TYPES.INTERVIEW_CANCELLED
      : parsed.data.status === "rescheduled"
        ? NOTIFICATION_TYPES.INTERVIEW_RESCHEDULED
        : NOTIFICATION_TYPES.INTERVIEW_SCHEDULED;

  await notifyUser({
    userId: interview.application.jobSeeker.user_id,
    title: "Interview updated",
    message: `Your interview for ${interview.application.jobPosting.job_title} was updated. Status: ${updated.status}.`,
    type,
  });

  return NextResponse.json({ interview: updated });
}
