"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Label, Select, Textarea } from "@/components/ui";

type Resume = {
  resume_id: number;
  file_name: string;
};

export function ApplyForm({
  jobId,
  resumes,
}: {
  jobId: number;
  resumes: Resume[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setOk("");
    setLoading(true);

    try {
      const form = new FormData(e.currentTarget);

      const payload = {
        job_id: jobId,
        resume_id: form.get("resume_id")
          ? Number(form.get("resume_id"))
          : null,
        cover_letter: String(form.get("cover_letter") || ""),
      };

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        setError("Server returned an invalid response. Check terminal logs.");
        setLoading(false);
        return;
      }

      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Could not submit application.");
        return;
      }

      setOk("Application submitted.");
      router.push("/seeker/applications");
      router.refresh();
    } catch {
      setLoading(false);
      setError("Something went wrong while applying.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? <Alert>{error}</Alert> : null}
      {ok ? <Alert tone="info">{ok}</Alert> : null}

      <div>
        <Label>Resume</Label>
        <Select name="resume_id" defaultValue={resumes[0]?.resume_id || ""}>
          <option value="">No resume selected</option>
          {resumes.map((r) => (
            <option key={r.resume_id} value={r.resume_id}>
              {r.file_name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Cover letter (optional)</Label>
        <Textarea name="cover_letter" rows={4} placeholder="Write a short message..." />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Apply now"}
      </Button>
    </form>
  );
}