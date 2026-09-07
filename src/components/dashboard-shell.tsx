"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Bell } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-semibold text-brand">JobLign PH</span>
        <Link href={items.find((i) => i.label === "Notifications")?.href || "#"} className="relative">
          <Bell className="h-5 w-5" />
          {unread ? (
            <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 text-[10px] text-white">
              {unread}
            </span>
          ) : null}
        </Link>
      </header>

      {open ? (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)}>
          <aside
            className="h-full w-72 bg-brand-dark p-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex justify-between">
              <p className="font-semibold">JobLign PH</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu">
                <X />
              </button>
            </div>
            <NavList items={items} pathname={pathname} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="lg:grid lg:grid-cols-[16rem_1fr]">
        <aside className="hidden min-h-screen bg-brand-dark p-5 text-white lg:block">
          <p className="text-lg font-semibold">JobLign PH</p>
          <p className="mt-1 text-sm text-white/70">{title}</p>
          <div className="mt-6">
            <NavList items={items} pathname={pathname} />
          </div>
        </aside>
        <div>
          <div className="hidden items-center justify-between border-b border-line bg-white px-8 py-4 lg:flex">
            <div>
              <p className="text-sm text-muted">Welcome,</p>
              <h1 className="text-xl font-semibold">{name}</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={items.find((i) => i.label === "Notifications")?.href || "#"}
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
                className="text-sm text-red-600"
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
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
