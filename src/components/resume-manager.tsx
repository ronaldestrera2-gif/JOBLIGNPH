"use client";

import { useRouter } from "next/navigation";
import { Button, Card } from "@/components/ui";

export function ResumeManager({
  resumes,
}: {
  resumes: { resume_id: number; file_name: string; uploaded_at: string }[];
}) {
  const router = useRouter();

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    await fetch("/api/resumes", { method: "POST", body: data });
    form.reset();
    router.refresh();
  }

  async function remove(id: number) {
    await fetch(`/api/resumes/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-semibold">Upload or replace a resume</h2>
        <p className="mt-1 text-sm text-muted">PDF, DOC, or DOCX. Maximum 5 MB.</p>
        <form onSubmit={upload} className="mt-3 space-y-3">
          <input type="file" name="file" accept=".pdf,.doc,.docx" required className="block text-sm" />
          {resumes.length ? (
            <select name="replace_id" className="w-full rounded-lg border border-line px-3 py-2 text-sm">
              <option value="">Upload as a new file</option>
              {resumes.map((r) => (
                <option key={r.resume_id} value={r.resume_id}>Replace {r.file_name}</option>
              ))}
            </select>
          ) : null}
          <Button type="submit">Upload</Button>
        </form>
      </Card>
      {resumes.map((r) => (
        <Card key={r.resume_id} className="flex items-center justify-between gap-3">
          <div>
            <p className="font-medium">{r.file_name}</p>
            <p className="text-xs text-muted">Uploaded {new Date(r.uploaded_at).toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            <a className="rounded-lg border border-line px-3 py-2 text-sm" href={`/api/resumes/${r.resume_id}/file`}>
              View
            </a>
            <Button type="button" variant="danger" onClick={() => remove(r.resume_id)}>Delete</Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
