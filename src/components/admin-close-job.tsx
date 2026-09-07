"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export function AdminCloseJob({ jobId }: { jobId: number }) {
  const router = useRouter();
  async function close() {
    await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "closed", closed_reason: "Closed by administrator" }),
    });
    router.refresh();
  }
  return (
    <Button type="button" variant="danger" onClick={close}>Close posting</Button>
  );
}
