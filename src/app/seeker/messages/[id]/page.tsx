import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageSession } from "@/lib/authz";
import { MessageThread } from "@/components/message-thread";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePageSession();
  const { id } = await params;
  const conversation = await prisma.conversation.findUnique({
    where: { conversation_id: Number(id) },
    include: {
      messages: { orderBy: { created_at: "asc" }, include: { sender: true } },
      participants: true,
    },
  });
  if (!conversation?.participants.some((p) => p.user_id === Number(user.id))) notFound();

  return (
    <MessageThread
      conversationId={conversation.conversation_id}
      currentUserId={Number(user.id)}
      initialMessages={conversation.messages.map((m) => ({
        message_id: m.message_id,
        body: m.body,
        created_at: m.created_at.toISOString(),
        sender_id: m.sender_id,
        sender_name: `${m.sender.first_name} ${m.sender.last_name}`,
      }))}
    />
  );
}
