import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageSession, getSeekerForUser } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { Card } from "@/components/ui";
import { ProfileMeter, StatusBadge } from "@/components/status";
import { matchSeekerToJob } from "@/lib/matching-service";
import { formatPesoRange, isExpired, profileCompletion } from "@/lib/utils";

export default async function SeekerHome() {
  const user = await requirePageSession([ROLES.JOB_SEEKER]);
  const seeker = await getSeekerForUser(Number(user.id));
  if (!seeker) return <Card>Profile missing. Please contact support.</Card>;

  const applications = await prisma.application.findMany({
    where: { seeker_id: seeker.seeker_id },
  });
  const counts = {
    applied: applications.filter((a) => a.status === "applied").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    interviews: applications.filter((a) => a.status === "interview").length,
    offers: applications.filter((a) => a.status === "offered" || a.status === "hired").length,
  };
  const notifications = await prisma.notification.findMany({
    where: { user_id: Number(user.id) },
    orderBy: { created_at: "desc" },
    take: 5,
  });
  const jobs = await prisma.jobPosting.findMany({
    where: { status: "active" },
    include: { employer: true },
    take: 20,
  });
  const recs = [];
  for (const job of jobs) {
    if (isExpired(job.deadline)) continue;
    const match = await matchSeekerToJob(seeker.seeker_id, job.job_id);
    if (match) recs.push({ job, match });
  }
  recs.sort((a, b) => b.match.matchScore - a.match.matchScore);

  const completion = profileCompletion([
    seeker.headline,
    seeker.education,
    seeker.work_experience,
    seeker.experience_years,
    seeker.location,
    seeker.employment_type_preference,
    seeker.availability,
    seeker.certifications,
    seeker.seekerSkills,
    seeker.resumes,
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Applied", counts.applied],
          ["Shortlisted", counts.shortlisted],
          ["Interviews", counts.interviews],
          ["Offers", counts.offers],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-1 text-3xl font-semibold">{value}</p>
          </Card>
        ))}
      </div>
      <Card>
        <ProfileMeter value={completion} />
      </Card>
      <div className="flex flex-wrap gap-2">
        {[
          ["/seeker/jobs", "Find Jobs"],
          ["/seeker/applications", "My Applications"],
          ["/seeker/resume", "My Resume"],
          ["/seeker/profile", "My Profile"],
          ["/seeker/recommendations", "Recommendations"],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="rounded-lg bg-brand px-3 py-2 text-sm text-white">{label}</Link>
        ))}
      </div>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Recommended jobs</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {recs.slice(0, 4).map(({ job, match }) => (
            <Link key={job.job_id} href={`/jobs/${job.job_id}`}>
              <Card>
                <div className="flex justify-between">
                  <h3 className="font-semibold">{job.job_title}</h3>
                  <StatusBadge value={`${match.matchScore}%`} />
                </div>
                <p className="text-sm text-muted">{job.employer.company_name} • {job.location}</p>
                <p className="mt-2 text-sm">{formatPesoRange(job.salary_min, job.salary_max, job.salary_range)}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent notifications</h2>
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.notification_id}>
              <p className="font-medium">{n.title}</p>
              <p className="text-sm text-muted">{n.message}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
