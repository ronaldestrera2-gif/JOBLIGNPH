import { prisma } from "@/lib/prisma";
import { getSeekerForUser, requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { Card, EmptyState } from "@/components/ui";
import { StatusBadge } from "@/components/status";
import { CancelInterviewButton } from "@/components/cancel-interview-button";

export default async function SeekerInterviewsPage() {
  const user = await requirePageSession([ROLES.JOB_SEEKER]);
  const seeker = await getSeekerForUser(Number(user.id));

  if (!seeker) {
    return <Card>Profile not found.</Card>;
  }

  const interviews = await prisma.interview.findMany({
    where: {
      application: {
        seeker_id: seeker.seeker_id,
      },
    },
    include: {
      application: {
        include: {
          jobPosting: {
            include: {
              employer: true,
            },
          },
        },
      },
    },
    orderBy: {
      interview_date: "desc",
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Interviews</h1>

      {interviews.length === 0 ? (
        <EmptyState title="No interviews yet." />
      ) : null}

      {interviews.map((interview) => {
        const job = interview.application.jobPosting;
        const status = (interview.status || "").toLowerCase();

        return (
          <Card key={interview.interview_id} className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{job.job_title}</h2>
                <p className="text-sm text-muted">{job.employer.company_name}</p>

                {interview.interview_date ? (
                  <p className="mt-2 text-sm">
                    Date: {new Date(interview.interview_date).toLocaleDateString()}
                  </p>
                ) : null}

                {interview.interview_time ? (
                  <p className="text-sm">Time: {interview.interview_time}</p>
                ) : null}

                {interview.location ? (
                  <p className="text-sm">Location: {interview.location}</p>
                ) : null}
              </div>

              <StatusBadge value={interview.status} />
            </div>

            {status === "scheduled" ? (
              <CancelInterviewButton interviewId={interview.interview_id} />
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}