import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getEmployerForUser, requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { calculateMatchScore } from "@/lib/matching";
import { Card, EmptyState, Select } from "@/components/ui";
import { MatchPanel, StatusBadge } from "@/components/status";
import { ApplicantActions } from "@/components/applicant-actions";
import { InterviewForm } from "@/components/interview-form";

export default async function JobApplicantsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const user = await requirePageSession([ROLES.EMPLOYER]);
  const employer = await getEmployerForUser(Number(user.id));
  const { id } = await params;
  const { sort } = await searchParams;
  const job = await prisma.jobPosting.findUnique({
    where: { job_id: Number(id) },
    include: { jobSkills: { include: { skill: true } } },
  });
  if (!job || job.employer_id !== employer?.employer_id) notFound();

  const applicants = await prisma.application.findMany({
    where: { job_id: job.job_id },
    include: {
      jobSeeker: {
        include: { user: true, seekerSkills: { include: { skill: true } } },
      },
      resume: true,
    },
  });

  const rows = applicants.map((a) => {
    const match = calculateMatchScore({
      candidateSkills: a.jobSeeker.seekerSkills.map((s) => s.skill.skill_name),
      requiredSkills: job.jobSkills.map((s) => s.skill.skill_name),
    });
    return { a, match };
  });

  rows.sort((x, y) => {
    if (sort === "experience") return (y.a.jobSeeker.experience_years ?? 0) - (x.a.jobSeeker.experience_years ?? 0);
    if (sort === "date") return y.a.applied_at.getTime() - x.a.applied_at.getTime();
    return y.match.matchScore - x.match.matchScore;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Applicants for {job.job_title}</h1>
      <form>
        <Select name="sort" defaultValue={sort || "score"}>
          <option value="score">Match score</option>
          <option value="experience">Experience</option>
          <option value="date">Application date</option>
        </Select>
        <button className="ml-2 rounded-lg border border-line px-3 py-2 text-sm">Sort</button>
      </form>
      {rows.length === 0 ? <EmptyState title="No applicants yet." /> : null}
      {rows.map(({ a, match }) => (
        <Card key={a.application_id} className="space-y-3">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <p className="font-semibold">{a.jobSeeker.user.first_name} {a.jobSeeker.user.last_name}</p>
              <p className="text-sm text-muted">{a.jobSeeker.headline}</p>
              <p className="text-sm">{a.jobSeeker.education}</p>
              <p className="text-sm">{a.jobSeeker.experience_years ?? 0} years experience</p>
            </div>
            <StatusBadge value={a.status} />
          </div>
          <MatchPanel score={match.matchScore} matching={match.matchingSkills} missing={match.missingSkills} />
          {a.resume ? (
            <a className="text-sm text-brand" href={`/api/resumes/${a.resume.resume_id}/file`}>View resume</a>
          ) : null}
          <ApplicantActions
            applicationId={a.application_id}
            status={a.status}
            seekerUserId={a.jobSeeker.user_id}
            jobId={job.job_id}
          />
          <InterviewForm applicationId={a.application_id} />
        </Card>
      ))}
    </div>
  );
}
