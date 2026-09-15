"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Textarea } from "@/components/ui";

export function CancelInterviewButton({
  interviewId,
}: {
  interviewId: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!reason.trim()) {
      setError("Please type a reason for cancelling.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/interviews/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        interview_id: interviewId,
        reason: reason.trim(),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Could not cancel interview.");
      return;
    }

    setOpen(false);
    setReason("");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {!open ? (
        <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
          Cancel Interview
        </Button>
      ) : (
        <div className="space-y-2 rounded-xl border border-line p-3">
          <p className="text-sm font-medium">Reason for cancellation</p>
          <Textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Type why you are cancelling this interview..."
          />
          {error ? <Alert>{error}</Alert> : null}
          <div className="flex gap-2">
            <Button type="button" disabled={loading} onClick={submit}>
              {loading ? "Sending..." : "Confirm Cancel"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() => {
                setOpen(false);
                setError("");
                setReason("");
              }}
            >
              Back
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}