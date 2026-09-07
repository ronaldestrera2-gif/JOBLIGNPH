import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getEmployerForUser, requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { Card } from "@/components/ui";
import { JobForm } from "@/components/job-form";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageSession([ROLES.EMPLOYER]);
  const employer = await getEmployerForUser(Number(user.id));
  const { id } = await params;
  const job = await prisma.jobPosting.findUnique({
    where: { job_id: Number(id) },
    include: { jobSkills: { include: { skill: true } } },
  });
  if (!job || job.employer_id !== employer?.employer_id) notFound();

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h1 className="text-xl font-semibold">Edit job</h1>
        <Link className="text-sm text-brand" href={`/employer/jobs/${job.job_id}/applicants`}>View applicants</Link>
      </div>
      <Card>
        <JobForm
          jobId={job.job_id}
          initial={{
            job_title: job.job_title,
            job_description: job.job_description,
            location: job.location || "",
            employment_type: job.employment_type || "full-time",
            salary_min: job.salary_min,
            salary_max: job.salary_max,
            deadline: job.deadline ? job.deadline.toISOString().slice(0, 10) : "",
            status: job.status,
            skills: job.jobSkills.map((s) => ({
              skill_name: s.skill.skill_name,
              required_level: s.required_level || "intermediate",
            })),
          }}
        />
      </Card>
    </div>
  );
}
