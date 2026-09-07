import Link from "next/link";
import { getSeekerForUser, requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { matchSeekerToJob } from "@/lib/matching-service";
import { formatPesoRange, isExpired } from "@/lib/utils";
import { Card, EmptyState } from "@/components/ui";
import { MatchPanel } from "@/components/status";

export default async function RecommendationsPage() {
  const user = await requirePageSession([ROLES.JOB_SEEKER]);
  const seeker = await getSeekerForUser(Number(user.id));
  const jobs = await prisma.jobPosting.findMany({
    where: { status: "active" },
    include: { employer: true },
  });
  const recs = [];
  for (const job of jobs) {
    if (isExpired(job.deadline) || !seeker) continue;
    const match = await matchSeekerToJob(seeker.seeker_id, job.job_id);
    if (match) recs.push({ job, match });
  }
  recs.sort((a, b) => b.match.matchScore - a.match.matchScore);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Skill-based recommendations</h1>
      <p className="text-sm text-muted">
        Match scores compare your skills with required skills. They do not guarantee employment.
      </p>
      {recs.length === 0 ? <EmptyState title="No recommendations yet. Add skills to your profile." /> : null}
      {recs.map(({ job, match }) => (
        <Card key={job.job_id} className="space-y-3">
          <div>
            <Link href={`/jobs/${job.job_id}`} className="text-lg font-semibold">{job.job_title}</Link>
            <p className="text-sm text-muted">
              {job.employer.company_name} • {job.location} • {job.employment_type}
            </p>
            <p className="text-sm">{formatPesoRange(job.salary_min, job.salary_max, job.salary_range)}</p>
            {job.deadline ? <p className="text-xs text-muted">Deadline {job.deadline.toLocaleDateString()}</p> : null}
          </div>
          <MatchPanel score={match.matchScore} matching={match.matchingSkills} missing={match.missingSkills} />
        </Card>
      ))}
    </div>
  );
}
