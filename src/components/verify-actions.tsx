"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export function VerifyActions({ employerId }: { employerId: number }) {
  const router = useRouter();
  async function decide(verification_status: "verified" | "rejected") {
    await fetch(`/api/admin/employers/${employerId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verification_status }),
    });
    router.refresh();
  }
  return (
    <div className="flex gap-2">
      <Button type="button" onClick={() => decide("verified")}>Verify</Button>
      <Button type="button" variant="danger" onClick={() => decide("rejected")}>Reject</Button>
    </div>
  );
}
