import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSeekerForUser, requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { Card } from "@/components/ui";
import { ApplicationTimeline } from "@/components/status";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePageSession([ROLES.JOB_SEEKER]);
  const seeker = await getSeekerForUser(Number(user.id));
  const { id } = await params;
  const application = await prisma.application.findUnique({
    where: { application_id: Number(id) },
    include: {
      jobPosting: { include: { employer: true } },
      interviews: true,
      resume: true,
    },
  });
  if (!application || application.seeker_id !== seeker?.seeker_id) notFound();

  return (
    <Card className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{application.jobPosting.job_title}</h1>
        <p className="text-muted">{application.jobPosting.employer.company_name}</p>
      </div>
      <ApplicationTimeline status={application.status} />
      <p className="text-sm whitespace-pre-wrap">{application.cover_letter}</p>
      {application.resume ? <p className="text-sm">Resume: {application.resume.file_name}</p> : null}
      <div>
        <h2 className="font-semibold">Interviews</h2>
        {application.interviews.map((i) => (
          <p key={i.interview_id} className="text-sm text-muted">
            {i.status}: {i.interview_date?.toLocaleDateString()} {i.interview_time} • {i.location}
          </p>
        ))}
      </div>
    </Card>
  );
}
