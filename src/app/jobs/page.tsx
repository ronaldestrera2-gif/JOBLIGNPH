import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/public-header";
import { formatPesoRange, isExpired } from "@/lib/utils";
import { Card, EmptyState, Input, Select, Badge } from "@/components/ui";
import { EMPLOYMENT_TYPES } from "@/lib/constants";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const jobs = await prisma.jobPosting.findMany({
    where: {
      status: sp.status || "active",
      ...(sp.q
        ? {
            OR: [
              { job_title: { contains: sp.q } },
              { job_description: { contains: sp.q } },
              { location: { contains: sp.q } },
            ],
          }
        : {}),
      ...(sp.title ? { job_title: { contains: sp.title } } : {}),
      ...(sp.location ? { location: { contains: sp.location } } : {}),
      ...(sp.employment_type ? { employment_type: sp.employment_type } : {}),
      ...(sp.skill
        ? { jobSkills: { some: { skill: { skill_name: { contains: sp.skill } } } } }
        : {}),
    },
    include: { employer: true, jobSkills: { include: { skill: true } } },
    orderBy: sp.sort === "deadline" ? { deadline: "asc" } : { posted_at: "desc" },
  });

  const visible = jobs.filter((j) => j.status !== "active" || !isExpired(j.deadline) || sp.status);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Find jobs</h1>
        <form className="mt-4 grid gap-3 rounded-2xl border border-line bg-white p-4 md:grid-cols-6">
          <Input name="q" placeholder="Keyword" defaultValue={sp.q} />
          <Input name="title" placeholder="Job title" defaultValue={sp.title} />
          <Input name="location" placeholder="Location" defaultValue={sp.location} />
          <Input name="skill" placeholder="Skill" defaultValue={sp.skill} />
          <Select name="employment_type" defaultValue={sp.employment_type || ""}>
            <option value="">Any type</option>
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
          <Select name="sort" defaultValue={sp.sort || "date"}>
            <option value="date">Newest</option>
            <option value="deadline">Deadline</option>
          </Select>
          <button className="rounded-lg bg-brand px-4 py-2 text-sm text-white md:col-span-6">Search</button>
        </form>
        <div className="mt-6 grid gap-4">
          {visible.length === 0 ? <EmptyState title="No jobs match those filters." /> : null}
          {visible.map((job) => (
            <Link key={job.job_id} href={`/jobs/${job.job_id}`}>
              <Card className="hover:border-brand">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{job.job_title}</h2>
                    <p className="text-sm text-muted">{job.employer.company_name} • {job.location}</p>
                  </div>
                  <Badge>{job.employment_type}</Badge>
                </div>
                <p className="mt-2 text-sm">{formatPesoRange(job.salary_min, job.salary_max, job.salary_range)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.jobSkills.map((s) => (
                    <Badge key={s.job_skill_id} tone="blue">{s.skill.skill_name}</Badge>
                  ))}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
