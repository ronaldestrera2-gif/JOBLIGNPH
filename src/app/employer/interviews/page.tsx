import { prisma } from "@/lib/prisma";
import { getEmployerForUser, requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { Card, EmptyState } from "@/components/ui";
import { StatusBadge } from "@/components/status";
import { InterviewStatusForm } from "@/components/interview-status-form";

export default async function EmployerInterviewsPage() {
  const user = await requirePageSession([ROLES.EMPLOYER]);
  const employer = await getEmployerForUser(Number(user.id));
  const interviews = await prisma.interview.findMany({
    where: { application: { jobPosting: { employer_id: employer?.employer_id } } },
    include: {
      application: {
        include: { jobSeeker: { include: { user: true } }, jobPosting: true },
      },
    },
  });
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Interviews</h1>
      {interviews.length === 0 ? <EmptyState title="No interviews yet." /> : null}
      {interviews.map((i) => (
        <Card key={i.interview_id} className="space-y-2">
          <div className="flex justify-between">
            <div>
              <p className="font-medium">
                {i.application.jobSeeker.user.first_name} {i.application.jobSeeker.user.last_name}
              </p>
              <p className="text-sm text-muted">{i.application.jobPosting.job_title}</p>
              <p className="text-sm">{i.interview_date?.toLocaleDateString()} {i.interview_time} • {i.location}</p>
            </div>
            <StatusBadge value={i.status} />
          </div>
          <InterviewStatusForm id={i.interview_id} status={i.status} />
        </Card>
      ))}
    </div>
  );
}
