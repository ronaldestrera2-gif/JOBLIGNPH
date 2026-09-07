import { prisma } from "@/lib/prisma";
import { requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { DashboardShell } from "@/components/dashboard-shell";
import { seekerNav } from "@/lib/nav";

export default async function SeekerLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageSession([ROLES.JOB_SEEKER]);
  const unread = await prisma.notification.count({
    where: { user_id: Number(user.id), is_read: false },
  });
  return (
    <DashboardShell title="Job Seeker" name={user.name || "Job seeker"} unread={unread} items={seekerNav}>
      {children}
    </DashboardShell>
  );
}
