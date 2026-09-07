import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublicHeader } from "@/components/public-header";
import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { formatPesoRange, isExpired } from "@/lib/utils";
import { calculateMatchScore } from "@/lib/matching";
import { Badge, Card } from "@/components/ui";
import { MatchPanel } from "@/components/status";
import { ApplyForm } from "@/components/apply-form";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const job = await prisma.jobPosting.findUnique({
    where: { job_id: Number(id) },
    include: {
      employer: { include: { companyProfile: true } },
      jobSkills: { include: { skill: true } },
    },
  });

  if (!job) notFound();

  const session = await auth();
  let match = null;
  let resumes: { resume_id: number; file_name: string }[] = [];
  let alreadyApplied = false;

  if (session?.user?.role === ROLES.JOB_SEEKER) {
    const seeker = await prisma.jobSeeker.findUnique({
      where: { user_id: Number(session.user.id) },
      include: {
        seekerSkills: { include: { skill: true } },
        resumes: true,
      },
    });

    if (seeker) {
      match = calculateMatchScore({
        candidateSkills: seeker.seekerSkills.map((s) => s.skill.skill_name),
        requiredSkills: job.jobSkills.map((s) => s.skill.skill_name),
      });
      resumes = seeker.resumes;
      alreadyApplied = Boolean(
        await prisma.application.findUnique({
          where: {
            seeker_id_job_id: {
              seeker_id: seeker.seeker_id,
              job_id: job.job_id,
            },
          },
        })
      );
    }
  }

  const closed = job.status !== "active" || isExpired(job.deadline);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-4">
        <Card>
          {/* Company Logo + Name (Clickable for full profile) */}
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/profile/company/${job.employer.employer_id}`}
              className="flex items-center gap-4 group"
            >
              <div className="h-14 w-14 rounded-lg overflow-hidden bg-gray-100 border shrink-0 flex items-center justify-center group-hover:ring-2 group-hover:ring-blue-400 transition">
                {job.employer.companyProfile?.logo_path ? (
                  <img
                    src={job.employer.companyProfile.logo_path}
                    alt={job.employer.company_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold text-gray-400">
                    {job.employer.company_name.charAt(0)}
                  </span>
                )}
              </div>

              <div>
                <p className="text-sm text-blue-600 group-hover:underline font-medium">
                  {job.employer.company_name}
                </p>
                <h1 className="text-3xl font-semibold text-slate-900">
                  {job.job_title}
                </h1>
              </div>
            </Link>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{job.location}</Badge>
            <Badge tone="blue">{job.employment_type}</Badge>
            <Badge tone={closed ? "red" : "green"}>
              {closed ? "Closed" : "Open"}
            </Badge>
          </div>

          <p className="mt-4">
            {formatPesoRange(job.salary_min, job.salary_max, job.salary_range)}
          </p>

          {job.deadline ? (
            <p className="text-sm text-muted">
              Deadline: {job.deadline.toLocaleDateString()}
            </p>
          ) : null}

          <p className="mt-4 whitespace-pre-wrap text-sm leading-6">
            {job.job_description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {job.jobSkills.map((s) => (
              <Badge key={s.job_skill_id} tone="purple">
                {s.skill.skill_name} • {s.required_level}
              </Badge>
            ))}
          </div>
        </Card>

        {match ? (
          <MatchPanel
            score={match.matchScore}
            matching={match.matchingSkills}
            missing={match.missingSkills}
          />
        ) : null}

        {session?.user?.role === ROLES.JOB_SEEKER ? (
          alreadyApplied ? (
            <Card>
              You already applied to this role. Track it under{" "}
              <Link className="text-brand" href="/seeker/applications">
                My Applications
              </Link>
              .
            </Card>
          ) : closed ? (
            <Card>This posting is closed or expired.</Card>
          ) : (
            <ApplyForm jobId={job.job_id} resumes={resumes} />
          )
        ) : (
          <Card>
            <Link className="text-brand" href="/login">
              Sign in as a job seeker
            </Link>{" "}
            to apply.
          </Card>
        )}
      </main>
    </div>
  );
}