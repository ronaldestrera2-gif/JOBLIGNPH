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
      resumes: {
        orderBy: { uploaded_at: "desc" },
        take: 1,
      },
    },
  });

  if (!seeker) notFound();

  const resume = seeker.resumes[0] || null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Cover */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-44 relative mb-20">
        <div className="absolute top-4 left-4">
          <BackButton />
        </div>

        <div className="absolute -bottom-16 left-6 md:left-10 flex items-end gap-5">
          <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg shrink-0">
            {seeker.profile_picture ? (
              <img
                src={seeker.profile_picture}
                alt={`${seeker.user.first_name} ${seeker.user.last_name}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600 text-3xl font-bold">
                {seeker.user.first_name.charAt(0)}
                {seeker.user.last_name.charAt(0)}
              </div>
            )}
          </div>

          <div className="pb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {seeker.user.first_name} {seeker.user.last_name}
            </h1>
            <p className="text-slate-600">
              {seeker.headline || "Job Seeker"}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="font-semibold text-lg mb-3">About</h2>
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-800">Location:</span>{" "}
                {seeker.location || "Not specified"}
              </p>
              <p>
                <span className="font-medium text-slate-800">Experience:</span>{" "}
                {seeker.experience_years
                  ? `${seeker.experience_years} years`
                  : "Not specified"}
              </p>
              <p>
                <span className="font-medium text-slate-800">Availability:</span>{" "}
                {seeker.availability || "Not specified"}
              </p>
              <p>
                <span className="font-medium text-slate-800">Preferred Type:</span>{" "}
                {seeker.employment_type_preference || "Any"}
              </p>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-lg mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {seeker.seekerSkills.length > 0 ? (
                seeker.seekerSkills.map((s) => (
                  <Badge key={s.seeker_skill_id} tone="blue">
                    {s.skill.skill_name}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-slate-500">No skills listed</p>
              )}
            </div>
          </Card>

          {/* Resume Card */}
          <Card className="p-5">
            <h2 className="font-semibold text-lg mb-3">Resume</h2>
            {resume ? (
              <a
                href={`/api/resumes/${resume.resume_id}/file`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition"
              >
                📄 View Resume ({resume.file_name})
              </a>
            ) : (
              <p className="text-sm text-slate-500">No resume uploaded</p>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <h2 className="font-semibold text-lg mb-3">Education</h2>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">
              {seeker.education || "No education information provided."}
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-lg mb-3">Work Experience</h2>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">
              {seeker.work_experience || "No work experience provided."}
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-lg mb-3">Certifications</h2>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">
              {seeker.certifications || "No certifications listed."}
            </p>
          </Card>

          {seeker.other_qualifications && (
            <Card className="p-5">
              <h2 className="font-semibold text-lg mb-3">Other Qualifications</h2>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">
                {seeker.other_qualifications}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}