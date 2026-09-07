"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1.5 rounded-lg backdrop-blur transition"
    >
      ← Back
    </button>
  );
}   