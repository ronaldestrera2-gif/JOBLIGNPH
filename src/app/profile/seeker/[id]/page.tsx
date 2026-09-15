import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import { BackButton } from "@/components/back-button";

export default async function SeekerPublicProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const seeker = await prisma.jobSeeker.findUnique({
    where: { seeker_id: Number(id) },
    include: {
      user: true,
      seekerSkills: { include: { skill: true } },
      resumes: { orderBy: { uploaded_at: "desc" } },
      certificationFiles: { orderBy: { uploaded_at: "desc" } },
    },
  });

  if (!seeker) notFound();

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
      {/* Visible Back button top-left */}
      <div className="pt-2">
        <BackButton fallback="/employer/applicants" label="← Back to Applicants" />
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full border bg-slate-100">
          {seeker.profile_picture ? (
            <img
              src={seeker.profile_picture}
              alt={`${seeker.user.first_name} ${seeker.user.last_name}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
              {seeker.user.first_name?.[0]}
              {seeker.user.last_name?.[0]}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-semibold">
            {seeker.user.first_name} {seeker.user.last_name}
          </h1>
          <p className="text-muted">{seeker.headline || "No headline"}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="mb-3 text-lg font-semibold">About</h2>
            <p className="text-sm">Location: {seeker.location || "N/A"}</p>
            <p className="text-sm">
              Experience: {seeker.experience_years ?? 0} years
            </p>
            <p className="text-sm">
              Availability: {seeker.availability || "N/A"}
            </p>
            <p className="text-sm">
              Preferred Type: {seeker.employment_type_preference || "Any"}
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-lg font-semibold">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {seeker.seekerSkills.length ? (
                seeker.seekerSkills.map((s) => (
                  <Badge key={s.seeker_skill_id} tone="blue">
                    {s.skill.skill_name}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted">No skills listed</p>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-lg font-semibold">Resume</h2>
            {seeker.resumes.length ? (
              <div className="space-y-2">
                {seeker.resumes.map((r) => (
                  <a
                    key={r.resume_id}
                    href={`/api/resumes/${r.resume_id}/file`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100"
                  >
                    📄 View Resume ({r.file_name})
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No resume uploaded.</p>
            )}
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card className="p-5">
            <h2 className="mb-3 text-lg font-semibold">Education</h2>
            <p className="whitespace-pre-wrap text-sm text-slate-600">
              {seeker.education || "No education information provided."}
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-lg font-semibold">Work Experience</h2>
            <p className="whitespace-pre-wrap text-sm text-slate-600">
              {seeker.work_experience || "No work experience provided."}
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-lg font-semibold">Certifications</h2>
            {seeker.certificationFiles.length ? (
              <div className="space-y-2">
                {seeker.certificationFiles.map((c) => (
                  <a
                    key={c.cert_id}
                    href={
                      c.file_path.startsWith("/")
                        ? c.file_path
                        : `/uploads/${c.file_path}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-100"
                  >
                    📎 {c.file_name}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No certification files uploaded.</p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-lg font-semibold">Other Qualifications</h2>
            <p className="whitespace-pre-wrap text-sm text-slate-600">
              {seeker.other_qualifications || "None listed."}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}