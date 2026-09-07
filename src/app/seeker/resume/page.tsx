import { getSeekerForUser, requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { ResumeManager } from "@/components/resume-manager";

export default async function ResumePage() {
  const user = await requirePageSession([ROLES.JOB_SEEKER]);
  const seeker = await getSeekerForUser(Number(user.id));
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">My resume</h1>
      <ResumeManager
        resumes={(seeker?.resumes ?? []).map((r) => ({
          resume_id: r.resume_id,
          file_name: r.file_name,
          uploaded_at: r.uploaded_at.toISOString(),
        }))}
      />
    </div>
  );
}
