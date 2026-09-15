"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function HomeNav({
  isLoggedIn,
  dashboardHref,
}: {
  isLoggedIn: boolean;
  dashboardHref?: string;
}) {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    cn(
      "rounded-lg px-3 py-2 font-medium transition",
      pathname === href
        ? "bg-[#0b4f6c] text-white"
        : "text-[#50677a] hover:bg-[#e8f1f5] hover:text-[#0b4f6c]"
    );

  return (
    <nav className="flex items-center gap-3">
      <Link href="/" className={linkClass("/")}>
        Homepage
      </Link>

      <Link href="/jobs" className={linkClass("/jobs")}>
        Find jobs
      </Link>

      {isLoggedIn ? (
        <Link
          href={dashboardHref || "/"}
          className="rounded-lg bg-[#0b4f6c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#08384d]"
        >
          Dashboard
        </Link>
      ) : (
        <>
          <Link href="/login" className={linkClass("/login")}>
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-[#0b4f6c] px-4 py-2 text-sm font-medium text-[#0b4f6c] transition hover:bg-[#e8f1f5]"
          >
            Register
          </Link>
        </>
      )}
    </nav>
  );
}