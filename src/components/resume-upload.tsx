"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Label } from "@/components/ui";

type ResumeItem = {
  resume_id: number;
  file_name: string;
};

export function ResumeUpload({
  resumes,
}: {
  resumes: ResumeItem[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setOk("");
    setLoading(true);

    const form = new FormData(e.currentTarget);

    
    const res = await fetch("/api/resumes", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Could not upload resume.");
      return;
    }

    setOk("Resume uploaded.");
    router.refresh();
    e.currentTarget.reset();
  }

  async function onDelete(resumeId: number) {
    setError("");
    setOk("");

    const res = await fetch(`/api/resumes/${resumeId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not delete resume.");
      return;
    }

    setOk("Resume deleted.");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Resume</h2>
      <p className="text-sm text-muted">
        Upload PDF, DOC, or DOCX. Max size 5MB.
      </p>

      {error ? <Alert>{error}</Alert> : null}
      {ok ? <Alert tone="info">{ok}</Alert> : null}

      <form onSubmit={onUpload} className="space-y-3">
        <div>
          <Label>Choose resume file</Label>
          <input
            type="file"
            name="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            required
            className="mt-1 block w-full text-sm"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload Resume"}
        </Button>
      </form>

      <div className="space-y-2">
        {resumes.length === 0 ? (
          <p className="text-sm text-muted">No resume uploaded yet.</p>
        ) : (
          resumes.map((r) => (
            <div
              key={r.resume_id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line p-3"
            >
              <p className="text-sm font-medium">{r.file_name}</p>
              <div className="flex gap-2">
                <a
                  className="text-sm text-brand"
                  href={`/api/resumes/${r.resume_id}/file`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
                <button
                  type="button"
                  className="text-sm text-red-600"
                  onClick={() => onDelete(r.resume_id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}