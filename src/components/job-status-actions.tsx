"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export function JobStatusActions({ jobId, status }: { jobId: number; status: string }) {
  const router = useRouter();
  async function setStatus(next: string) {
    await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
  }
  return (
    <div className="flex gap-2">
      {status !== "closed" ? (
        <Button type="button" variant="secondary" onClick={() => setStatus("closed")}>Close</Button>
      ) : (
        <Button type="button" variant="secondary" onClick={() => setStatus("active")}>Reopen</Button>
      )}
    </div>
  );
}
