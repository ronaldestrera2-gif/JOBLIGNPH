"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export function CancelApplicationButton({
  applicationId,
  label = "Cancel Application",
}: {
  applicationId: number;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function cancel() {
    setLoading(true);

    const res = await fetch("/api/applications/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        application_id: applicationId,
        status: "cancelled",
      }),
    });

    setLoading(false);

    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={loading}
      onClick={cancel}
    >
      {loading ? "Cancelling..." : label}
    </Button>
  );
}