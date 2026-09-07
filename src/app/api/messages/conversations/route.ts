import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { ROLES, NOTIFICATION_TYPES } from "@/lib/constants";
import { notifyUser } from "@/lib/notifications";

async function canMessage(userId: number, role: string, otherUserId: number, jobId?: number) {
  if (role === ROLES.ADMIN) return true;
  if (role === ROLES.JOB_SEEKER) {
    const seeker = await prisma.jobSeeker.findUnique({ where: { user_id: userId } });
    if (!seeker) return false;
    return prisma.application.findFirst({
      where: {
        seeker_id: seeker.seeker_id,
        ...(jobId ? { job_id: jobId } : {}),
        jobPosting: { employer: { user_id: otherUserId } },
      },
    });
  }
  if (role === ROLES.EMPLOYER) {
    const employer = await prisma.employer.findUnique({ where: { user_id: userId } });
    if (!employer) return false;
    return prisma.application.findFirst({
      where: {
        jobSeeker: { user_id: otherUserId },
        jobPosting: { employer_id: employer.employer_id, ...(jobId ? { job_id: jobId } : {}) },
      },
    });
  }
  return false;
}

export async function GET() {
  const gate = await requireApiSession();
  if ("error" in gate && gate.error) return gate.error;
  const userId = Number(gate.user!.id);
  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { user_id: userId } } },
    include: {
      job: true,
      participants: { include: { user: true } },
      messages: { orderBy: { created_at: "desc" }, take: 1 },
    },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json({
    conversations: conversations.map((c) => ({
      conversation_id: c.conversation_id,
      job_title: c.job?.job_title ?? "General",
      last_message: c.messages[0]?.body,
      last_at: c.messages[0]?.created_at ?? c.created_at,
      other: c.participants
        .filter((p) => p.user_id !== userId)
        .map((p) => ({
          user_id: p.user.user_id,
          name: `${p.user.first_name} ${p.user.last_name}`,
        }))[0],
    })),
  });
}

export async function POST(req: Request) {
  const gate = await requireApiSession();
  if ("error" in gate && gate.error) return gate.error;
  const { other_user_id, job_id, body } = await req.json();
  const userId = Number(gate.user!.id);
  const otherUserId = Number(other_user_id);
  if (!otherUserId || otherUserId === userId) {
    return NextResponse.json({ error: "Invalid recipient." }, { status: 400 });
  }

  const allowed = await canMessage(userId, gate.user!.role, otherUserId, job_id ? Number(job_id) : undefined);
  if (!allowed) {
    return NextResponse.json(
      { error: "You can only message people involved in a legitimate application." },
      { status: 403 },
    );
  }

  const existing = await prisma.conversation.findFirst({
    where: {
      job_id: job_id ? Number(job_id) : null,
      AND: [
        { participants: { some: { user_id: userId } } },
        { participants: { some: { user_id: otherUserId } } },
      ],
    },
  });

  const conversation =
    existing ??
    (await prisma.conversation.create({
      data: {
        job_id: job_id ? Number(job_id) : null,
        participants: {
          create: [{ user_id: userId }, { user_id: otherUserId }],
        },
      },
    }));

  if (body?.trim()) {
    await prisma.message.create({
      data: {
        conversation_id: conversation.conversation_id,
        sender_id: userId,
        body: String(body).trim(),
      },
    });
    await notifyUser({
      userId: otherUserId,
      title: "New message",
      message: "You received a new recruitment message on JobLign PH.",
      type: NOTIFICATION_TYPES.NEW_MESSAGE,
    });
  }

  return NextResponse.json({ conversation_id: conversation.conversation_id }, { status: 201 });
}
