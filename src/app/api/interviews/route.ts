import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { NOTIFICATION_TYPES, ROLES } from "@/lib/constants";
import { interviewSchema } from "@/lib/validations";
import { notifyUser } from "@/lib/notifications";

export async function GET() {
  const gate = await requireApiSession();
  if ("error" in gate && gate.error) return gate.error;
  const userId = Number(gate.user!.id);

  if (gate.user!.role === ROLES.JOB_SEEKER) {
    const seeker = await prisma.jobSeeker.findUnique({ where: { user_id: userId } });
    const interviews = await prisma.interview.findMany({
      where: { application: { seeker_id: seeker?.seeker_id } },
      include: { application: { include: { jobPosting: { include: { employer: true } } } } },
      orderBy: { interview_id: "desc" },
    });
    return NextResponse.json({ interviews });
  }

  if (gate.user!.role === ROLES.EMPLOYER) {
    const employer = await prisma.employer.findUnique({ where: { user_id: userId } });
    const interviews = await prisma.interview.findMany({
      where: { application: { jobPosting: { employer_id: employer?.employer_id } } },
      include: {
        application: {
          include: {
            jobSeeker: { include: { user: true } },
            jobPosting: true,
          },
        },
      },
      orderBy: { interview_id: "desc" },
    });
    return NextResponse.json({ interviews });
  }

  const interviews = await prisma.interview.findMany({
    include: { application: { include: { jobPosting: true, jobSeeker: { include: { user: true } } } } },
    take: 200,
  });
  return NextResponse.json({ interviews });
}

export async function POST(req: Request) {
  const gate = await requireApiSession([ROLES.EMPLOYER]);
  if ("error" in gate && gate.error) return gate.error;
  const parsed = interviewSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid interview details." },
      { status: 400 },
    );
  }

  const employer = await prisma.employer.findUnique({
    where: { user_id: Number(gate.user!.id) },
  });
  const application = await prisma.application.findUnique({
    where: { application_id: parsed.data.application_id },
    include: { jobPosting: true, jobSeeker: { include: { user: true } } },
  });
  if (!application || application.jobPosting.employer_id !== employer?.employer_id) {
    return NextResponse.json(
      { error: "You can only schedule interviews for your own applicants." },
      { status: 403 },
    );
  }

  const interview = await prisma.interview.create({
    data: {
      application_id: application.application_id,
      interview_date: new Date(parsed.data.interview_date),
      interview_time: parsed.data.interview_time,
      location: parsed.data.location,
      notes: parsed.data.notes || null,
      status: parsed.data.status,
    },
  });

  await prisma.application.update({
    where: { application_id: application.application_id },
    data: { status: "interview" },
  });

  await notifyUser({
    userId: application.jobSeeker.user_id,
    title: "Interview scheduled",
    message: `An interview for ${application.jobPosting.job_title} is scheduled on ${parsed.data.interview_date} at ${parsed.data.interview_time} (${parsed.data.location}).`,
    type: NOTIFICATION_TYPES.INTERVIEW_SCHEDULED,
  });

  return NextResponse.json({ interview }, { status: 201 });
}
