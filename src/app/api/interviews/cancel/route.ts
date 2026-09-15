import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";

export async function POST(req: Request) {
  const gate = await requireApiSession([ROLES.JOB_SEEKER]);
  if ("error" in gate && gate.error) return gate.error;

  const body = await req.json();
  const interviewId = Number(body.interview_id);
  const reason = String(body.reason || "").trim();

  if (!reason) {
    return NextResponse.json(
      { error: "Cancellation reason is required." },
      { status: 400 }
    );
  }

  const seeker = await prisma.jobSeeker.findUnique({
    where: { user_id: Number(gate.user!.id) },
  });

  if (!seeker) {
    return NextResponse.json({ error: "Seeker not found." }, { status: 404 });
  }

  // Adjust field names if your schema differs
  const interview = await prisma.interview.findUnique({
    where: { interview_id: interviewId },
    include: {
      application: {
        include: {
          jobPosting: {
            include: {
              employer: {
                include: { user: true },
              },
            },
          },
          jobSeeker: {
            include: { user: true },
          },
        },
      },
    },
  });

  if (!interview) {
    return NextResponse.json({ error: "Interview not found." }, { status: 404 });
  }

  if (interview.application.jobSeeker.seeker_id !== seeker.seeker_id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  if (interview.status !== "scheduled") {
    return NextResponse.json(
      { error: "Only scheduled interviews can be cancelled." },
      { status: 400 }
    );
  }

  // 1) Cancel interview
  await prisma.interview.update({
    where: { interview_id: interviewId },
    data: {
      status: "cancelled",
      // if you have cancellation_reason column, save it:
      // cancellation_reason: reason,
    },
  });

  // 2) Also mark application cancelled (optional but useful)
  await prisma.application.update({
    where: { application_id: interview.application.application_id },
    data: { status: "cancelled" },
  });

  const employerUserId = interview.application.jobPosting.employer.user_id;
  const seekerUser = interview.application.jobSeeker.user;
  const jobTitle = interview.application.jobPosting.job_title;

  // 3) Create / reuse conversation and send message to employer
  let conversation = await prisma.conversation.findFirst({
    where: {
      job_id: interview.application.job_id,
      participants: {
        some: { user_id: Number(gate.user!.id) },
      },
      AND: {
        participants: {
          some: { user_id: employerUserId },
        },
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        job_id: interview.application.job_id,
        participants: {
          create: [
            { user_id: Number(gate.user!.id) },
            { user_id: employerUserId },
          ],
        },
      },
    });
  }

  await prisma.message.create({
    data: {
      conversation_id: conversation.conversation_id,
      sender_id: Number(gate.user!.id),
      body: `Interview cancellation for "${jobTitle}".\n\nReason: ${reason}\n\n- ${seekerUser.first_name} ${seekerUser.last_name}`,
    },
  });

  // 4) Notify employer
  await prisma.notification.create({
    data: {
      user_id: employerUserId,
      title: "Interview cancelled",
      message: `${seekerUser.first_name} ${seekerUser.last_name} cancelled the interview for ${jobTitle}. Reason: ${reason}`,
      notification_type: "interview",
      is_read: false,
    },
  });

  return NextResponse.json({ ok: true });
}