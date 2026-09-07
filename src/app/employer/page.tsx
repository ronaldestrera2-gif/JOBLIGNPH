import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getEmployerForUser, requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { Card } from "@/components/ui";
import { StatusBadge } from "@/components/status";

export default async function EmployerHome() {
  const user = await requirePageSession([ROLES.EMPLOYER]);
  const employer = await getEmployerForUser(Number(user.id));
  if (!employer) return <Card>Company profile missing.</Card>;

  const jobs = await prisma.jobPosting.findMany({
    where: { employer_id: employer.employer_id },
    include: { applications: true },
    orderBy: { posted_at: "desc" },
  });
  const applications = jobs.flatMap((j) => j.applications);
  const stats = {
    active: jobs.filter((j) => j.status === "active").length,
    applicants: applications.length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    interviews: applications.filter((a) => a.status === "interview").length,
  };
  const recent = await prisma.application.findMany({
    where: { jobPosting: { employer_id: employer.employer_id } },
    include: { jobSeeker: { include: { user: true } }, jobPosting: true },
    orderBy: { applied_at: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Employer Dashboard</h1>
          <StatusBadge value={employer.verification_status} />
        </div>
        <Link href="/employer/jobs/new" className="rounded-lg bg-brand px-4 py-2 text-sm text-white">Create Job</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Active Jobs", stats.active],
          ["Total Applicants", stats.applicants],
          ["Shortlisted", stats.shortlisted],
          ["Interviews", stats.interviews],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <p className="text-sm text-muted">{label}</p>
            <p className="text-3xl font-semibold">{value}</p>
          </Card>
        ))}
      </div>
      <section>
        <h2 className="mb-3 font-semibold">Recent applicants</h2>
        <div className="space-y-2">
          {recent.map((a) => (
            <Card key={a.application_id} className="flex justify-between">
              <div>
                <p className="font-medium">{a.jobSeeker.user.first_name} {a.jobSeeker.user.last_name}</p>
                <p className="text-sm text-muted">{a.jobPosting.job_title}</p>
              </div>
              <StatusBadge value={a.status} />
            </Card>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-3 font-semibold">Job postings</h2>
        <div className="space-y-2">
          {jobs.map((j) => (
            <Link key={j.job_id} href={`/employer/jobs/${j.job_id}`}>
              <Card className="flex justify-between">
                <p className="font-medium">{j.job_title}</p>
                <StatusBadge value={j.status} />
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
