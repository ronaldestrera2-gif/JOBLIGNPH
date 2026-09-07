import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#12263a]">

      {/* HEADER */}
      <header className="border-b border-[#d9e2ea] bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-[#0b4f6c]"
          >
            JobLign PH
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link
              href="/jobs"
              className="font-medium text-[#50677a] transition hover:text-[#0b4f6c]"
            >
              Find jobs
            </Link>

            <Link
              href="/login"
              className="font-medium text-[#50677a] transition hover:text-[#0b4f6c]"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-[#0b4f6c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#08384d]"
            >
              Register
            </Link>
          </nav>

        </div>
      </header>


      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">

        {/* HERO */}
        <section className="grid items-center gap-14 lg:grid-cols-2">

          {/* LEFT */}
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


            {/* BUTTONS */}
            <div className="mt-8 flex flex-wrap gap-4">

              <Link
                href="/register"
                className="rounded-lg bg-[#0b4f6c] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#08384d]"
              >
                Create an account
              </Link>

              <Link
                href="/jobs"
                className="rounded-lg border border-[#cbd7e0] bg-white px-6 py-3 font-semibold text-[#12263a] shadow-sm transition hover:bg-[#eef3f7]"
              >
                Browse jobs
              </Link>

            </div>

          </div>


          {/* RIGHT - FEATURE CARDS */}
          <div className="grid gap-5 sm:grid-cols-2">

            {/* Job Seekers */}
            <div className="rounded-2xl border border-[#d9e2ea] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#e8f1f5] text-[#0b4f6c]">
                👤
              </div>

              <h2 className="text-lg font-bold text-[#12263a]">
                Job Seekers
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#5c7185]">
                Profiles, resumes, applications, interviews, and
                recommendations.
              </p>
            </div>


            {/* Employers */}
            <div className="rounded-2xl border border-[#d9e2ea] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#e8f1f5] text-[#0b4f6c]">
                🏢
              </div>

              <h2 className="text-lg font-bold text-[#12263a]">
                Employers
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#5c7185]">
                Company pages, job posts, applicant review, and scheduling.
              </p>
            </div>


            {/* Administrators */}
            <div className="rounded-2xl border border-[#d9e2ea] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#e8f1f5] text-[#0b4f6c]">
                ⚙️
              </div>

              <h2 className="text-lg font-bold text-[#12263a]">
                Administrators
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#5c7185]">
                User management, employer verification, monitoring, and
                reports.
              </p>
            </div>


            {/* Matching */}
            <div className="rounded-2xl border border-[#d9e2ea] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#e8f1f5] text-[#0b4f6c]">
                ✓
              </div>

              <h2 className="text-lg font-bold text-[#12263a]">
                Matching
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#5c7185]">
                Transparent skill overlap scoring from 1–100.
              </p>
            </div>

          </div>

        </section>


        {/* BOTTOM CTA */}
        <section className="mt-20 rounded-2xl bg-[#0b4f6c] px-8 py-12 text-center shadow-sm md:px-12">

          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Find the right opportunity today.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#d9e9ef]">
            Build your profile, discover jobs that match your skills, and
            connect with employers across the Philippines.
          </p>

          <div className="mt-7 flex justify-center gap-4">

            <Link
              href="/register"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-[#0b4f6c] transition hover:bg-[#eef3f7]"
            >
              Create an account
            </Link>

            <Link
              href="/jobs"
              className="rounded-lg border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Browse available jobs
            </Link>

          </div>

        </section>

      </main>
    </div>
  );
}