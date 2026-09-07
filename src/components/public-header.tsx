import Link from "next/link";
import { auth } from "@/lib/auth";
import { dashboardPath } from "@/lib/auth";

export async function PublicHeader() {
  const session = await auth();

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        
        {/* Homepage Button */}
        <Link
          href="/"
          className="rounded-lg bg-[#0b4f6c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#08384d]"
        >
          Homepage
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/jobs" className="text-muted hover:text-brand">
            Find jobs
          </Link>

          {session?.user ? (
            <Link
              href={dashboardPath(session.user.role)}
              className="rounded-lg bg-brand px-3 py-2 text-white"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-muted hover:text-brand">
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