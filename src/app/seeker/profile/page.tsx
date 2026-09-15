import { getSeekerForUser, requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { Card } from "@/components/ui";
import { SeekerProfileForm } from "@/components/seeker-profile-form";
import { ResumeUpload } from "@/components/resume-upload";
import { CertificationUpload } from "@/components/certification-upload";
import { prisma } from "@/lib/prisma";

export default async function SeekerProfilePage() {
  const user = await requirePageSession([ROLES.JOB_SEEKER]);
  const seeker = await getSeekerForUser(Number(user.id));

  if (!seeker) {
    return <Card>Profile not found.</Card>;
  }

  const resumes = await prisma.resume.findMany({
    where: { seeker_id: seeker.seeker_id },
    orderBy: { uploaded_at: "desc" },
    select: {
      resume_id: true,
      file_name: true,
    },
  });

  const certifications = await prisma.certificationFile.findMany({
    where: { seeker_id: seeker.seeker_id },
    orderBy: { uploaded_at: "desc" },
    select: {
      cert_id: true,
      file_name: true,
      file_path: true,
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="mb-4 text-xl font-semibold">My profile</h1>
        <SeekerProfileForm
          profile={{
            first_name: seeker.user.first_name,
            last_name: seeker.user.last_name,
            headline: seeker.headline,
            education: seeker.education,
            work_experience: seeker.work_experience,
            experience_years: seeker.experience_years,
            location: seeker.location,
            employment_type_preference: seeker.employment_type_preference,
            availability: seeker.availability,
            other_qualifications: seeker.other_qualifications,
            skills: seeker.seekerSkills.map((s) => s.skill.skill_name),
            profile_picture: seeker.profile_picture,
          }}
        />
      </Card>

      <Card>
        <ResumeUpload resumes={resumes} />
      </Card>

      <Card>
        <CertificationUpload certifications={certifications} />
      </Card>
    </div>
  );
}