import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSeekerForUser, requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { Card, EmptyState } from "@/components/ui";
import { ApplicationTimeline, StatusBadge } from "@/components/status";

export default async function ApplicationsPage() {
  const user = await requirePageSession([ROLES.JOB_SEEKER]);
  const seeker = await getSeekerForUser(Number(user.id));
  const applications = await prisma.application.findMany({
    where: { seeker_id: seeker?.seeker_id },
    include: { jobPosting: { include: { employer: true } } },
    orderBy: { applied_at: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">My applications</h1>
      {applications.length === 0 ? <EmptyState title="You have not applied to any jobs yet." /> : null}
      {applications.map((app) => (
        <Card key={app.application_id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">{app.jobPosting.job_title}</h2>
              <p className="text-sm text-muted">{app.jobPosting.employer.company_name}</p>
            </div>
            <StatusBadge value={app.status} />
          </div>
          <div className="mt-4">
            <ApplicationTimeline status={app.status} />
          </div>
          <Link className="mt-3 inline-block text-sm text-brand" href={`/seeker/applications/${app.application_id}`}>
            View details
          </Link>
        </Card>
      ))}
    </div>
  );
}
