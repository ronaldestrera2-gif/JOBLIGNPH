"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function PublicNav({
  isLoggedIn,
  dashboardHref,
}: {
  isLoggedIn: boolean;
  dashboardHref?: string;
}) {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    cn(
      "rounded-lg px-3 py-2 text-sm font-medium transition",
      pathname === href
        ? "bg-[#0b4f6c] text-white"
        : "text-[#50677a] hover:bg-[#e8f1f5] hover:text-[#0b4f6c]"
    );

  return (
    <nav className="flex items-center gap-2 text-sm">
      <Link href="/" className={linkClass("/")}>
        Homepage
      </Link>

      <Link href="/jobs" className={linkClass("/jobs")}>
        Find jobs
      </Link>

      {isLoggedIn ? (
        <Link
          href={dashboardHref || "/"}
          className="rounded-lg border border-[#0b4f6c] px-3 py-2 font-medium text-[#0b4f6c] transition hover:bg-[#e8f1f5]"
        >
          Dashboard
        </Link>
      ) : (
        <>
          <Link href="/login" className={linkClass("/login")}>
            Login
          </Link>

          {/* Register is action button, not active nav light */}
          <Link
            href="/register"
            className="rounded-lg border border-[#0b4f6c] px-3 py-2 font-medium text-[#0b4f6c] transition hover:bg-[#e8f1f5]"
          >
            Register
          </Link>
        </>
      )}
    </nav>
  );
}