"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Card, Label, Select, Textarea } from "@/components/ui";

export function ApplyForm({
  jobId,
  resumes,
}: {
  jobId: number;
  resumes: { resume_id: number; file_name: string }[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job_id: jobId,
        resume_id: Number(form.get("resume_id")),
        cover_letter: String(form.get("cover_letter") || ""),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not submit application.");
      setLoading(false);
      return;
    }
    router.push("/seeker/applications");
    router.refresh();
  }

  if (!resumes.length) {
    return (
      <Card>
        Upload a resume first from <a className="text-brand" href="/seeker/resume">My Resume</a> before applying.
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="font-semibold">Apply</h2>
      {error ? <div className="mt-3"><Alert>{error}</Alert></div> : null}
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div>
          <Label>Resume</Label>
          <Select name="resume_id" required>
            {resumes.map((r) => (
              <option key={r.resume_id} value={r.resume_id}>{r.file_name}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Cover letter</Label>
          <Textarea name="cover_letter" rows={5} required minLength={20} />
        </div>
        <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit application"}</Button>
      </form>
    </Card>
  );
}
