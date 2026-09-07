import { prisma } from "@/lib/prisma";
import { getSeekerForUser, requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { Card, EmptyState } from "@/components/ui";
import { StatusBadge } from "@/components/status";

export default async function SeekerInterviewsPage() {
  const user = await requirePageSession([ROLES.JOB_SEEKER]);
  const seeker = await getSeekerForUser(Number(user.id));
  const interviews = await prisma.interview.findMany({
    where: { application: { seeker_id: seeker?.seeker_id } },
    include: { application: { include: { jobPosting: { include: { employer: true } } } } },
  });
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Interviews</h1>
      {interviews.length === 0 ? <EmptyState title="No interviews scheduled." /> : null}
      {interviews.map((i) => (
        <Card key={i.interview_id}>
          <div className="flex justify-between gap-3">
            <div>
              <p className="font-semibold">{i.application.jobPosting.job_title}</p>
              <p className="text-sm text-muted">{i.application.jobPosting.employer.company_name}</p>
              <p className="mt-2 text-sm">
                {i.interview_date?.toLocaleDateString()} {i.interview_time} • {i.location}
              </p>
            </div>
            <StatusBadge value={i.status} />
          </div>
        </Card>
      ))}
    </div>
  );
}
