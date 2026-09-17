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
      {/* HEADER */}
      <header className="border-b border-[#d9e2ea] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-ph.png"
              alt="JobLign PH Logo"
              width={36}
              height={36}
              className="rounded-full object-cover"
            />
            <span className="text-xl font-bold text-[#0b4f6c] sm:text-2xl">
              JobLign PH
            </span>
          </Link>

          <HomeNav isLoggedIn={isLoggedIn} dashboardHref={dashboardHref} />
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <section className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/* LEFT */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#0b4f6c] sm:text-sm">
              Nationwide • Skill-based matching
            </p>

            <h1 className="max-w-2xl text-3xl font-bold leading-tight text-[#12263a] sm:text-4xl md:text-5xl lg:text-6xl">
              Connect Filipino talent with the right employers.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-[#5c7185] sm:mt-6 sm:text-lg sm:leading-8">
              JobLign PH matches skills, education, experience, and preferences
              with open vacancies. Match scores are recommendations only and
              never guarantee employment.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
              {isLoggedIn ? (
                <Link
                  href={dashboardHref}
                  className="rounded-lg bg-[#0b4f6c] px-6 py-3 text-center font-semibold text-white shadow-sm transition hover:bg-[#08384d]"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="rounded-lg bg-[#0b4f6c] px-6 py-3 text-center font-semibold text-white shadow-sm transition hover:bg-[#08384d]"
                >
                  Create an account
                </Link>
              )}

              <Link
                href="/jobs"
                className="rounded-lg border border-[#cbd7e0] bg-white px-6 py-3 text-center font-semibold text-[#12263a] shadow-sm transition hover:bg-[#eef3f7]"
              >
                Browse jobs
              </Link>
            </div>
          </div>

          {/* RIGHT CARDS */}
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            <div className="rounded-2xl border border-[#d9e2ea] bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-base font-bold sm:text-lg">Job Seekers</h2>
              <p className="mt-2 text-sm leading-6 text-[#5c7185]">
                Profiles, resumes, applications, interviews, and recommendations.
              </p>
            </div>

            <div className="rounded-2xl border border-[#d9e2ea] bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-base font-bold sm:text-lg">Employers</h2>
              <p className="mt-2 text-sm leading-6 text-[#5c7185]">
                Company pages, job posts, applicant review, and scheduling.
              </p>
            </div>

            <div className="rounded-2xl border border-[#d9e2ea] bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-base font-bold sm:text-lg">Administrators</h2>
              <p className="mt-2 text-sm leading-6 text-[#5c7185]">
                User management, employer verification, monitoring, and reports.
              </p>
            </div>

            <div className="rounded-2xl border border-[#d9e2ea] bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-base font-bold sm:text-lg">Matching</h2>
              <p className="mt-2 text-sm leading-6 text-[#5c7185]">
                Transparent skill overlap scoring from 1–100.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}