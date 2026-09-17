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

  const linkClass = (href: string, solid = false) =>
    cn(
      "rounded-lg px-3 py-2 text-sm font-medium transition whitespace-nowrap",
      solid
        ? "bg-[#0b4f6c] text-white hover:bg-[#08384d]"
        : pathname === href
          ? "bg-[#0b4f6c] text-white"
          : "text-[#50677a] hover:bg-[#e8f1f5] hover:text-[#0b4f6c]"
    );

  return (
    <nav className="flex max-w-full flex-wrap items-center justify-end gap-2">
      <Link href="/" className={linkClass("/")}>
        Homepage
      </Link>

      <Link href="/jobs" className={linkClass("/jobs")}>
        Find jobs
      </Link>

      {isLoggedIn ? (
        <Link href={dashboardHref || "/"} className={linkClass(dashboardHref || "/", true)}>
          Dashboard
        </Link>
      ) : (
        <>
          <Link href="/login" className={linkClass("/login")}>
            Login
          </Link>
          <Link href="/register" className={linkClass("/register", true)}>
            Register
          </Link>
        </>
      )}
    </nav>
  );
}