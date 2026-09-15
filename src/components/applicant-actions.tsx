"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Alert } from "@/components/ui";

export function ApplicantActions({
  applicationId,
  status,
}: {
  applicationId: number;
  status: string;
  seekerUserId?: number;
  jobId?: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function updateStatus(nextStatus: string) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/applications/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_id: applicationId,
          status: nextStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not update application status.");
        setLoading(false);
        return;
      }

      router.refresh();
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  // Final statuses: no buttons
  if (status === "hired" || status === "rejected" || status === "cancelled") {
    return null;
  }

  return (
    <div className="space-y-2">
      {error ? <Alert>{error}</Alert> : null}

      {/* Applied → Interview or Reject */}
      {status === "applied" ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={loading}
            onClick={() => updateStatus("interview")}
          >
            Interview
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={() => updateStatus("rejected")}
          >
            Reject
          </Button>
        </div>
      ) : null}

      {/* Interview → Hired or Reject */}
      {status === "interview" ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={loading}
            onClick={() => updateStatus("hired")}
          >
            Hired
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={() => updateStatus("rejected")}
          >
            Reject
          </Button>
        </div>
      ) : null}
    </div>
  );
}