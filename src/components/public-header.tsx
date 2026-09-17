import Link from "next/link";
import Image from "next/image";
import { auth, dashboardPath } from "@/lib/auth";

export async function PublicHeader() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);
  const dashboardHref = session?.user?.role
    ? dashboardPath(session.user.role)
    : "/";

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-ph.png"
            alt="JobLign PH"
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
          <span className="text-lg font-semibold text-brand">JobLign PH</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <Link href="/" className="rounded-lg px-3 py-2 text-muted hover:text-brand">
            Homepage
          </Link>
          <Link href="/jobs" className="rounded-lg px-3 py-2 text-muted hover:text-brand">
            Find jobs
          </Link>

          {isLoggedIn ? (
            <Link
              href={dashboardHref}
              className="rounded-lg bg-brand px-3 py-2 text-white"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-2 text-muted hover:text-brand">
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand px-3 py-2 text-white"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}