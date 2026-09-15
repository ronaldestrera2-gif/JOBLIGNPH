import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSeekerForUser, requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { calculateMatchScore } from "@/lib/matching";
import { formatPesoRange } from "@/lib/utils";
import { Card, EmptyState } from "@/components/ui";
import { MatchPanel } from "@/components/status";

export default async function RecommendationsPage() {
  const user = await requirePageSession([ROLES.JOB_SEEKER]);
  const seeker = await getSeekerForUser(Number(user.id));

  if (!seeker) {
    return <Card>Profile not found.</Card>;
  }

  const jobs = await prisma.jobPosting.findMany({
    where: { status: "active" },
    include: {
      employer: true,
      jobSkills: { include: { skill: true } },
    },
    orderBy: { posted_at: "desc" },
  });

  const candidateSkills = seeker.seekerSkills.map((s) => s.skill.skill_name);

  const rows = jobs
    .map((job) => {
      const match = calculateMatchScore({
        candidateSkills,
        requiredSkills: job.jobSkills.map((s) => s.skill.skill_name),
      });

      return { job, match };
    })
    .filter((row) => row.match.matchScore > 0)
    .sort((a, b) => b.match.matchScore - a.match.matchScore);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Skill-based recommendations</h1>
        <p className="mt-1 text-sm text-muted">
          Match scores compare your skills with required skills. They do not
          guarantee employment.
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No recommendations yet. Update your skills in My Profile." />
      ) : null}

      {rows.map(({ job, match }) => (
        <Card key={job.job_id} className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{job.job_title}</h2>
              <p className="text-sm text-muted">
                {job.employer.company_name} • {job.location} • {job.employment_type}
              </p>
              <p className="text-sm">
                {formatPesoRange(job.salary_min, job.salary_max, job.salary_range)}
              </p>
              {job.deadline ? (
                <p className="text-sm text-muted">
                  Deadline {new Date(job.deadline).toLocaleDateString()}
                </p>
              ) : null}
            </div>

            <Link
              href={`/jobs/${job.job_id}`}
              className="rounded-lg bg-[#0b4f6c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#08384d]"
            >
              View details
            </Link>
          </div>

          <MatchPanel
            score={match.matchScore}
            matching={match.matchingSkills}
            missing={match.missingSkills}
          />
        </Card>
      ))}
    </div>
  );
}