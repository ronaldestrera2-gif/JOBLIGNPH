"use client";

import { useState } from "react";
import { Alert, Button, Card } from "@/components/ui";
import { formatDistanceToNow } from "date-fns";

type Item = {
  notification_id: number;
  title: string;
  message: string;
  notification_type: string | null;
  is_read: boolean;
  created_at: string;
};

export function NotificationList({ items }: { items: Item[] }) {
  const [rows, setRows] = useState(items);
  const [error, setError] = useState("");

  async function mark(id?: number) {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id ? { notification_id: id } : { all: true }),
    });
    if (!res.ok) {
      setError("Could not update notifications.");
      return;
    }
    setRows((prev) => prev.map((n) => (id && n.notification_id !== id ? n : { ...n, is_read: true })));
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button type="button" variant="secondary" onClick={() => mark()}>Mark all as read</Button>
      </div>
      {error ? <Alert>{error}</Alert> : null}
      {rows.length === 0 ? <Card>No notifications yet.</Card> : null}
      {rows.map((n) => (
        <Card key={n.notification_id} className={n.is_read ? "opacity-70" : ""}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">{n.title}</p>
              <p className="mt-1 text-sm text-muted">{n.message}</p>
              <p className="mt-2 text-xs text-muted">
                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
              </p>
            </div>
            {!n.is_read ? (
              <Button type="button" variant="ghost" onClick={() => mark(n.notification_id)}>
                Mark read
              </Button>
            ) : null}
          </div>
        </Card>
      ))}
    </div>
  );
}
