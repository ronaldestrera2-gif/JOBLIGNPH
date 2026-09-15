import { requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { Card } from "@/components/ui";
import { ResumeBuilderForm } from "@/components/resume-builder-form";
import { getSeekerForUser } from "@/lib/authz";

export default async function ResumeBuilderPage() {
  const user = await requirePageSession([ROLES.JOB_SEEKER]);
  const seeker = await getSeekerForUser(Number(user.id));

  return (
    <Card>
      <h1 className="mb-2 text-xl font-semibold">Resume Builder</h1>
      <p className="mb-6 text-sm text-muted">
        Build your resume, add a photo, then download as PDF or Word. No AI required.
      </p>

      <ResumeBuilderForm
        initial={{
          first_name: seeker?.user.first_name || "",
          last_name: seeker?.user.last_name || "",
          headline: seeker?.headline || "",
          email: seeker?.user.email || "",
          location: seeker?.location || "",
          education: seeker?.education || "",
          work_experience: seeker?.work_experience || "",
          skills: seeker?.seekerSkills?.map((s) => s.skill.skill_name) || [],
          certifications: seeker?.certifications || "",
          photo: seeker?.profile_picture || "",
        }}
      />
    </Card>
  );
}