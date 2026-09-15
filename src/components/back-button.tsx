"use client";

import { useRouter } from "next/navigation";

export function BackButton({
  fallback = "/employer/applicants",
  label = "← Back",
}: {
  fallback?: string;
  label?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push(fallback);
        }
      }}
      className="inline-flex items-center rounded-lg border border-[#0b4f6c] bg-white px-4 py-2 text-sm font-semibold text-[#0b4f6c] shadow-sm transition hover:bg-[#e8f1f5]"
    >
      {label}
    </button>
  );
}