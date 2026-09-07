import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPesoRange(min?: number | null, max?: number | null, fallback?: string | null) {
  if (min != null && max != null) {
    return `₱${min.toLocaleString()} – ₱${max.toLocaleString()}`;
  }
  if (min != null) return `From ₱${min.toLocaleString()}`;
  if (max != null) return `Up to ₱${max.toLocaleString()}`;
  return fallback || "Not specified";
}

export function profileCompletion(fields: Array<string | number | null | undefined | unknown[]>) {
  if (fields.length === 0) return 0;
  const filled = fields.filter((f) => {
    if (Array.isArray(f)) return f.length > 0;
    if (typeof f === "number") return true;
    return Boolean(f && String(f).trim());
  }).length;
  return Math.round((filled / fields.length) * 100);
}

export function isExpired(deadline?: Date | string | null) {
  if (!deadline) return false;
  return new Date(deadline).getTime() < Date.now();
}

export function safeJsonList(value?: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
}
