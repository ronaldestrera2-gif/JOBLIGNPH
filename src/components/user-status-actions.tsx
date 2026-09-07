"use client";

import { useRouter } from "next/navigation";
import { Button, Select } from "@/components/ui";
import { USER_STATUSES } from "@/lib/constants";

export function UserStatusActions({ userId, status }: { userId: number; status: string }) {
  const router = useRouter();
  async function save(next: string) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, status: next }),
    });
    router.refresh();
  }
  return (
    <div className="flex gap-2">
      <Select defaultValue={status} onChange={(e) => save(e.target.value)}>
        {USER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </Select>
      <Button type="button" variant="secondary" onClick={() => save("active")}>Activate</Button>
      <Button type="button" variant="danger" onClick={() => save("suspended")}>Suspend</Button>
    </div>
  );
}
