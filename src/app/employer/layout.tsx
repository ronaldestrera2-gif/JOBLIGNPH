import { prisma } from "@/lib/prisma";
import { requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { DashboardShell } from "@/components/dashboard-shell";
import { employerNav } from "@/lib/nav";

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageSession([ROLES.EMPLOYER]);
  const unread = await prisma.notification.count({
    where: { user_id: Number(user.id), is_read: false },
  });
  return (
    <DashboardShell title="Employer" name={user.name || "Employer"} unread={unread} items={employerNav}>
      {children}
    </DashboardShell>
  );
}
