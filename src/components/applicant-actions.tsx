"use client";

import { useRouter } from "next/navigation";
import { Button, Select } from "@/components/ui";
import { APPLICATION_STATUSES } from "@/lib/constants";

export function ApplicantActions({
  applicationId,
  status,
  seekerUserId,
  jobId,
}: {
  applicationId: number;
  status: string;
  seekerUserId: number;
  jobId: number;
}) {
  const router = useRouter();

  async function updateStatus(next: string) {
    await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    router.refresh();
  }

  async function message() {
    const res = await fetch("/api/messages/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ other_user_id: seekerUserId, job_id: jobId }),
    });
    const data = await res.json();
    if (data.conversation_id) router.push(`/employer/messages/${data.conversation_id}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Select defaultValue={status} onChange={(e) => updateStatus(e.target.value)}>
        {APPLICATION_STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </Select>
      <Button type="button" variant="secondary" onClick={() => updateStatus("shortlisted")}>Shortlist</Button>
      <Button type="button" variant="danger" onClick={() => updateStatus("rejected")}>Reject</Button>
      <Button type="button" variant="ghost" onClick={message}>Message</Button>
    </div>
  );
}
