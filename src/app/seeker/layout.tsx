import { prisma } from "@/lib/prisma";
import { requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { DashboardShell } from "@/components/dashboard-shell";
import { seekerNav } from "@/lib/nav";

export default async function SeekerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePageSession([ROLES.JOB_SEEKER]);

  const seeker = await prisma.jobSeeker.findUnique({
    where: { user_id: Number(user.id) },
    include: {
      seekerSkills: true,
      resumes: true,
    },
  });

  const incomplete =
    !seeker ||
    !seeker.headline ||
    !seeker.education ||
    !seeker.location ||
    seeker.seekerSkills.length === 0 ||
    seeker.resumes.length === 0;

  const unread = await prisma.notification.count({
    where: { user_id: Number(user.id), is_read: false },
  });

  return (
    <DashboardShell
      title="Job Seeker"
      name={user.name || "Job seeker"}
      unread={unread}
      items={seekerNav}
    >
      {incomplete ? (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Please complete your profile, skills, and resume before applying to jobs.
        </div>
      ) : null}
      {children}
    </DashboardShell>
  );
}