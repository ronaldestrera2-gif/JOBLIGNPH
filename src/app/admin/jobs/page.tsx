import { prisma } from "@/lib/prisma";
import { requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { Card } from "@/components/ui";
import { StatusBadge } from "@/components/status";
import { AdminCloseJob } from "@/components/admin-close-job";

export default async function AdminJobsPage() {
  await requirePageSession([ROLES.ADMIN]);
  const jobs = await prisma.jobPosting.findMany({
    include: { employer: true },
    orderBy: { posted_at: "desc" },
  });
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Job monitoring</h1>
      {jobs.map((job) => (
        <Card key={job.job_id} className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold">{job.job_title}</p>
            <p className="text-sm text-muted">{job.employer.company_name} • {job.location}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge value={job.status} />
            {job.status !== "closed" ? <AdminCloseJob jobId={job.job_id} /> : null}
          </div>
        </Card>
      ))}
    </div>
  );
}
