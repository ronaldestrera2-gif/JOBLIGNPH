"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Alert } from "@/components/ui";

export function UserStatusActions({
  userId,
  status,
}: {
  userId: number;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function updateStatus(next: string) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          status: next,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Could not update user.");
        return;
      }

      router.refresh();
    } catch {
      setLoading(false);
      setError("Something went wrong.");
    }
  }

  return (
    <div className="space-y-2">
      {error ? <Alert>{error}</Alert> : null}

      <div className="flex flex-wrap gap-2">
        {status !== "active" ? (
          <Button
            type="button"
            disabled={loading}
            onClick={() => updateStatus("active")}
          >
            Activate
          </Button>
        ) : null}

        {status !== "suspended" ? (
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={() => updateStatus("suspended")}
          >
            Suspend
          </Button>
        ) : null}
      </div>
    </div>
  );
}