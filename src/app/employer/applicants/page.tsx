import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getEmployerForUser, requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { calculateMatchScore } from "@/lib/matching";
import { Card, EmptyState } from "@/components/ui";
import { StatusBadge } from "@/components/status";

export default async function AllApplicantsPage() {
  const user = await requirePageSession([ROLES.EMPLOYER]);
  const employer = await getEmployerForUser(Number(user.id));

  const applications = await prisma.application.findMany({
    where: { jobPosting: { employer_id: employer?.employer_id } },
    include: {
      jobPosting: { include: { jobSkills: { include: { skill: true } } } },
      jobSeeker: {
        include: {
          user: true,
          seekerSkills: { include: { skill: true } },
        },
      },
    },
    orderBy: { applied_at: "desc" },
  });

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Applicants</h1>

      {applications.length === 0 ? (
        <EmptyState title="No applicants yet." />
      ) : null}

      {applications.map((a) => {
        const match = calculateMatchScore({
          candidateSkills: a.jobSeeker.seekerSkills.map((s) => s.skill.skill_name),
          requiredSkills: a.jobPosting.jobSkills.map((s) => s.skill.skill_name),
        });

        return (
          <Card
            key={a.application_id}
            className="flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-4">
              {/* Profile Picture - also clickable */}
              <Link href={`/profile/seeker/${a.jobSeeker.seeker_id}`}>
                <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 border shrink-0 hover:ring-2 hover:ring-blue-400 transition">
                  {a.jobSeeker.profile_picture ? (
                    <img
                      src={a.jobSeeker.profile_picture}
                      alt={`${a.jobSeeker.user.first_name} ${a.jobSeeker.user.last_name}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                      {a.jobSeeker.user.first_name.charAt(0)}
                      {a.jobSeeker.user.last_name.charAt(0)}
                    </div>
                  )}
                </div>
              </Link>

              <div>
                <Link
                  href={`/profile/seeker/${a.jobSeeker.seeker_id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {a.jobSeeker.user.first_name} {a.jobSeeker.user.last_name}
                </Link>
                <p className="text-sm text-muted">
                  {a.jobPosting.job_title} • {match.matchScore}% match
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge value={a.status} />
              <Link
                className="text-sm text-brand"
                href={`/employer/jobs/${a.job_id}/applicants`}
              >
                Manage
              </Link>
            </div>
          </Card>
        );
      })}
    </div>
  );
}