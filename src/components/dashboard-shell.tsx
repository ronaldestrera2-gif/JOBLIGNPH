"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Bell, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string };

export function DashboardShell({
  title,
  name,
  unread,
  items,
  children,
}: {
  title: string;
  name: string;
  unread?: number;
  items: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const notificationsHref =
    items.find((i) => i.label.toLowerCase().includes("notification"))?.href ||
    "#";

  function isActive(href: string) {
    if (href === "/seeker" || href === "/employer" || href === "/admin") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* MOBILE TOP BAR */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-line bg-white px-3 py-3 lg:hidden">
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </button>

        <span className="truncate font-semibold text-brand">JobLign PH</span>

        <div className="flex items-center gap-2">
          <Link href={notificationsHref} className="relative rounded-full border border-line p-2">
            <Bell className="h-4 w-4" />
            {unread ? (
              <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-[10px] text-white">
                {unread}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-xs font-semibold text-red-600"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </header>

      {/* MOBILE SIDEBAR */}
      {open ? (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            className="h-full w-72 bg-[#0b4f6c] p-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo-ph.png"
                  alt="JobLign PH"
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">JobLign PH</p>
                  <p className="text-xs text-white/70">{title}</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>

            <NavList
              items={items}
              pathname={pathname}
              onNavigate={() => setOpen(false)}
              isActive={isActive}
            />

            <button
              type="button"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </aside>
        </div>
      ) : null}

      <div className="lg:flex">
        {/* DESKTOP SIDEBAR */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto bg-[#0b4f6c] p-4 text-white lg:block">
          <div className="mb-6 flex items-center gap-2">
            <Image
              src="/logo-ph.png"
              alt="JobLign PH"
              width={36}
              height={36}
              className="rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">JobLign PH</p>
              <p className="text-xs text-white/70">{title}</p>
            </div>
          </div>

          <NavList items={items} pathname={pathname} isActive={isActive} />

          <button
            type="button"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/90 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </aside>

        {/* CONTENT */}
        <div className="min-w-0 flex-1">
          <div className="sticky top-0 z-10 hidden items-center justify-between border-b border-line bg-white px-6 py-4 lg:flex">
            <div>
              <p className="text-sm text-muted">Welcome,</p>
              <p className="text-lg font-semibold">{name}</p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={notificationsHref}
                className="relative rounded-full border border-line p-2"
              >
                <Bell className="h-4 w-4" />
                {unread ? (
                  <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-[10px] text-white">
                    {unread}
                  </span>
                ) : null}
              </Link>

              <button
                type="button"
                className="text-sm font-medium text-red-600"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Logout
              </button>
            </div>
          </div>

          <main className="p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

function NavList({
  items,
  pathname,
  onNavigate,
  isActive,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
  isActive: (href: string) => boolean;
}) {
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "block rounded-lg px-3 py-2 text-sm",
              active ? "bg-white/15 font-medium" : "text-white/80 hover:bg-white/10",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}