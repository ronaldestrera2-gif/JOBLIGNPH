"use client";

import { useRouter } from "next/navigation";
import { Button, Select } from "@/components/ui";
import { INTERVIEW_STATUSES } from "@/lib/constants";

export function InterviewStatusForm({ id, status }: { id: number; status: string }) {
  const router = useRouter();
  async function save(next: string) {
    await fetch(`/api/interviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
  }
  return (
    <div className="flex gap-2">
      <Select defaultValue={status} onChange={(e) => save(e.target.value)}>
        {INTERVIEW_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </Select>
      <Button type="button" variant="secondary" onClick={() => save("cancelled")}>Cancel</Button>
    </div>
  );
}
