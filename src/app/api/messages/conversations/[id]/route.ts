import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { messageSchema } from "@/lib/validations";
import { notifyUser } from "@/lib/notifications";
import { NOTIFICATION_TYPES } from "@/lib/constants";

async function participant(conversationId: number, userId: number) {
  return prisma.conversationParticipant.findUnique({
    where: {
      conversation_id_user_id: { conversation_id: conversationId, user_id: userId },
    },
  });
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const gate = await requireApiSession();
  if ("error" in gate && gate.error) return gate.error;
  const { id } = await context.params;
  const conversationId = Number(id);
  const member = await participant(conversationId, Number(gate.user!.id));
  if (!member) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { conversation_id: conversationId },
    include: {
      job: true,
      participants: { include: { user: true } },
      messages: { orderBy: { created_at: "asc" }, include: { sender: true } },
    },
  });
  return NextResponse.json({
    conversation: {
      ...conversation,
      messages: conversation?.messages.map((m) => ({
        message_id: m.message_id,
        body: m.body,
        created_at: m.created_at,
        sender_id: m.sender_id,
        sender_name: `${m.sender.first_name} ${m.sender.last_name}`,
      })),
      participants: conversation?.participants.map((p) => ({
        user_id: p.user_id,
        name: `${p.user.first_name} ${p.user.last_name}`,
        role: p.user.role,
      })),
    },
  });
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const gate = await requireApiSession();
  if ("error" in gate && gate.error) return gate.error;
  const parsed = messageSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const { id } = await context.params;
  const conversationId = Number(id);
  const userId = Number(gate.user!.id);
  const member = await participant(conversationId, userId);
  if (!member) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  const message = await prisma.message.create({
    data: {
      conversation_id: conversationId,
      sender_id: userId,
      body: parsed.data.body,
    },
  });

  const others = await prisma.conversationParticipant.findMany({
    where: { conversation_id: conversationId, NOT: { user_id: userId } },
  });
  for (const other of others) {
    await notifyUser({
      userId: other.user_id,
      title: "New message",
      message: parsed.data.body.slice(0, 140),
      type: NOTIFICATION_TYPES.NEW_MESSAGE,
    });
  }

  return NextResponse.json({ message }, { status: 201 });
}
