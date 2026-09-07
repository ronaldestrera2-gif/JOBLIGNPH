import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getEmployerForUser, requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { Card, EmptyState } from "@/components/ui";
import { StatusBadge } from "@/components/status";
import { JobStatusActions } from "@/components/job-status-actions";

export default async function EmployerJobsPage() {
  const user = await requirePageSession([ROLES.EMPLOYER]);
  const employer = await getEmployerForUser(Number(user.id));
  const jobs = await prisma.jobPosting.findMany({
    where: { employer_id: employer?.employer_id },
    include: { _count: { select: { applications: true } } },
    orderBy: { posted_at: "desc" },
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Manage jobs</h1>
        <Link href="/employer/jobs/new" className="rounded-lg bg-brand px-4 py-2 text-sm text-white">Create Job</Link>
      </div>
      {jobs.length === 0 ? <EmptyState title="No job postings yet." /> : null}
      {jobs.map((job) => (
        <Card key={job.job_id} className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href={`/employer/jobs/${job.job_id}`} className="font-semibold">{job.job_title}</Link>
            <p className="text-sm text-muted">{job._count.applications} applicants</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge value={job.status} />
            <JobStatusActions jobId={job.job_id} status={job.status} />
          </div>
        </Card>
      ))}
    </div>
  );
}
