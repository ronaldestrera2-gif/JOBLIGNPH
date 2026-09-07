import { prisma } from "@/lib/prisma";
import { requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { Card } from "@/components/ui";
import { StatusBadge } from "@/components/status";

export default async function AdminApplicationsPage() {
  await requirePageSession([ROLES.ADMIN]);
  const applications = await prisma.application.findMany({
    include: {
      jobSeeker: { include: { user: true } },
      jobPosting: { include: { employer: true } },
    },
    orderBy: { applied_at: "desc" },
    take: 100,
  });
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Application monitoring</h1>
      {applications.map((a) => (
        <Card key={a.application_id} className="flex flex-wrap justify-between gap-3">
          <div>
            <p className="font-medium">
              {a.jobSeeker.user.first_name} {a.jobSeeker.user.last_name} → {a.jobPosting.job_title}
            </p>
            <p className="text-sm text-muted">{a.jobPosting.employer.company_name}</p>
          </div>
          <StatusBadge value={a.status} />
        </Card>
      ))}
    </div>
  );
}
