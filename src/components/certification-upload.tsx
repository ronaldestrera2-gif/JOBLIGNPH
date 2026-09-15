"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Label } from "@/components/ui";

type CertItem = {
  cert_id: number;
  file_name: string;
  file_path: string;
};

export function CertificationUpload({
  certifications,
}: {
  certifications: CertItem[];
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
    const res = await fetch("/api/certifications", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Could not upload certification.");
      return;
    }

    setOk("Certification uploaded.");
    router.refresh();
    e.currentTarget.reset();
  }

  async function onDelete(certId: number) {
    setError("");
    setOk("");

    const res = await fetch(`/api/certifications/${certId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Could not delete certification.");
      return;
    }

    setOk("Certification deleted.");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Certifications</h2>
      <p className="text-sm text-muted">
        Upload certificate files (PNG, JPG, WEBP, PDF). Max 5MB each.
      </p>

      {error ? <Alert>{error}</Alert> : null}
      {ok ? <Alert tone="info">{ok}</Alert> : null}

      <form onSubmit={onUpload} className="space-y-3">
        <div>
          <Label>Choose certification file</Label>
          <input
            type="file"
            name="certification"
            accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf"
            required
            className="mt-1 block w-full text-sm"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload Certification"}
        </Button>
      </form>

      <div className="space-y-2">
        {certifications.length === 0 ? (
          <p className="text-sm text-muted">No certifications uploaded yet.</p>
        ) : (
          certifications.map((c) => (
            <div
              key={c.cert_id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line p-3"
            >
              <p className="text-sm font-medium">{c.file_name}</p>
              <div className="flex gap-2">
                <a
                  className="text-sm text-brand"
                  href={c.file_path.startsWith("/") ? c.file_path : `/uploads/${c.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
                <button
                  type="button"
                  className="text-sm text-red-600"
                  onClick={() => onDelete(c.cert_id)}
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