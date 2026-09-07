import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageSession } from "@/lib/authz";
import { Card, EmptyState } from "@/components/ui";

export default async function MessagesPage() {
  const user = await requirePageSession();
  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { user_id: Number(user.id) } } },
    include: {
      job: true,
      participants: { include: { user: true } },
      messages: { orderBy: { created_at: "desc" }, take: 1 },
    },
  });
  const base = user.role === "employer" ? "/employer/messages" : user.role === "admin" ? "/admin" : "/seeker/messages";

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Messages</h1>
      {conversations.length === 0 ? (
        <EmptyState title="No conversations yet." hint="You can message after a job application is submitted." />
      ) : null}
      {conversations.map((c) => {
        const other = c.participants.find((p) => p.user_id !== Number(user.id));
        return (
          <Link key={c.conversation_id} href={`${base}/${c.conversation_id}`}>
            <Card>
              <p className="font-medium">
                {other ? `${other.user.first_name} ${other.user.last_name}` : "Conversation"}
              </p>
              <p className="text-sm text-muted">{c.job?.job_title ?? "Recruitment message"}</p>
              <p className="mt-1 text-sm">{c.messages[0]?.body}</p>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
