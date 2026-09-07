"use client";

import { useState } from "react";
import { Alert, Button, Card, Input } from "@/components/ui";
import { format } from "date-fns";

type Message = {
  message_id: number;
  body: string;
  created_at: string;
  sender_id: number;
  sender_name: string;
};

export function MessageThread({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: number;
  currentUserId: number;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/messages/conversations/${conversationId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not send message.");
      return;
    }
    setMessages((prev) => [
      ...prev,
      {
        message_id: data.message.message_id,
        body,
        created_at: new Date().toISOString(),
        sender_id: currentUserId,
        sender_name: "You",
      },
    ]);
    setBody("");
  }

  return (
    <Card>
      <div className="max-h-[28rem] space-y-3 overflow-y-auto">
        {messages.map((m) => (
          <div
            key={m.message_id}
            className={`rounded-xl p-3 text-sm ${m.sender_id === currentUserId ? "ml-8 bg-sky-50" : "mr-8 bg-slate-50"}`}
          >
            <p className="text-xs text-muted">{m.sender_name} • {format(new Date(m.created_at), "PPp")}</p>
            <p className="mt-1">{m.body}</p>
          </div>
        ))}
      </div>
      {error ? <div className="mt-3"><Alert>{error}</Alert></div> : null}
      <form onSubmit={send} className="mt-4 flex gap-2">
        <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a message" />
        <Button type="submit">Send</Button>
      </form>
    </Card>
  );
}
