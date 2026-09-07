"use client";

import { useRouter } from "next/navigation";
import { Button, Label, Select } from "@/components/ui";

export function SettingsForm({ requireVerification }: { requireVerification: string }) {
  const router = useRouter();
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        require_employer_verification: form.get("require_employer_verification"),
      }),
    });
    router.refresh();
  }
  return (
    <form onSubmit={save} className="max-w-md space-y-3">
      <div>
        <Label>Require employer verification before publishing jobs</Label>
        <Select name="require_employer_verification" defaultValue={requireVerification}>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </Select>
      </div>
      <Button type="submit">Save settings</Button>
    </form>
  );
}
