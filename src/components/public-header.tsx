import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { dashboardPath } from "@/lib/auth";
import { PublicNav } from "@/components/public-nav";

export async function PublicHeader() {
  const session = await auth();

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-ph.png"
            alt="JobLign PH Logo"
            width={36}
            height={36}
            className="rounded-full object-cover"
          />
          <span className="text-lg font-semibold text-brand">JobLign PH</span>
        </Link>

        <PublicNav
          isLoggedIn={Boolean(session?.user)}
          dashboardHref={
            session?.user?.role ? dashboardPath(session.user.role) : "/"
          }
        />
      </div>
    </header>
  );
}