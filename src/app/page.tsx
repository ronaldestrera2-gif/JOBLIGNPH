import Link from "next/link";
import Image from "next/image";
import { auth, dashboardPath } from "@/lib/auth";
import { HomeNav } from "@/components/home-nav";

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);
  const dashboardHref = session?.user?.role
    ? dashboardPath(session.user.role)
    : "/";

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#12263a]">
      <header className="border-b border-[#d9e2ea] bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-ph.png"
              alt="JobLign PH Logo"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <span className="text-2xl font-bold text-[#0b4f6c]">JobLign PH</span>
          </Link>

          <HomeNav isLoggedIn={isLoggedIn} dashboardHref={dashboardHref} />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
        <section className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#0b4f6c]">
              Nationwide • Skill-based matching
            </p>

            <h1 className="max-w-2xl text-4xl font-bold leading-tight text-[#12263a] md:text-5xl lg:text-6xl">
              Connect Filipino talent with the right employers.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#5c7185]">
              JobLign PH matches skills, education, experience, and preferences
              with open vacancies. Match scores are recommendations only and
              never guarantee employment.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              {isLoggedIn ? (
                <Link
                  href={dashboardHref}
                  className="rounded-lg bg-[#0b4f6c] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#08384d]"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="rounded-lg bg-[#0b4f6c] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#08384d]"
                >
                  Create an account
                </Link>
              )}

              <Link
                href="/jobs"
                className="rounded-lg border border-[#cbd7e0] bg-white px-6 py-3 font-semibold text-[#12263a] shadow-sm transition hover:bg-[#eef3f7]"
              >
                Browse jobs
              </Link>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#d9e2ea] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">Job Seekers</h2>
              <p className="mt-3 text-sm leading-6 text-[#5c7185]">
                Profiles, resumes, applications, interviews, and recommendations.
              </p>
            </div>

            <div className="rounded-2xl border border-[#d9e2ea] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">Employers</h2>
              <p className="mt-3 text-sm leading-6 text-[#5c7185]">
                Company pages, job posts, applicant review, and scheduling.
              </p>
            </div>

            <div className="rounded-2xl border border-[#d9e2ea] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">Administrators</h2>
              <p className="mt-3 text-sm leading-6 text-[#5c7185]">
                User management, employer verification, monitoring, and reports.
              </p>
            </div>

            <div className="rounded-2xl border border-[#d9e2ea] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">Matching</h2>
              <p className="mt-3 text-sm leading-6 text-[#5c7185]">
                Transparent skill overlap scoring from 1–100.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}