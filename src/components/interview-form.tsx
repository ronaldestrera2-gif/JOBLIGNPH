"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Input, Label, Textarea } from "@/components/ui";

export function InterviewForm({ applicationId }: { applicationId: number }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/interviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        application_id: applicationId,
        interview_date: form.get("interview_date"),
        interview_time: form.get("interview_time"),
        location: form.get("location"),
        notes: form.get("notes"),
        status: "scheduled",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not schedule interview.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 grid gap-2 md:grid-cols-2">
      {error ? <div className="md:col-span-2"><Alert>{error}</Alert></div> : null}
      <div><Label>Date</Label><Input type="date" name="interview_date" required /></div>
      <div><Label>Time</Label><Input type="time" name="interview_time" required /></div>
      <div className="md:col-span-2"><Label>Location / platform</Label><Input name="location" required /></div>
      <div className="md:col-span-2"><Label>Notes</Label><Textarea name="notes" rows={2} /></div>
      <Button type="submit">Schedule interview</Button>
    </form>
  );
}
