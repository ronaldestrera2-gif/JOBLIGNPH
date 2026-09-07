import { prisma } from "@/lib/prisma";
import { requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { DashboardShell } from "@/components/dashboard-shell";
import { adminNav } from "@/lib/nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageSession([ROLES.ADMIN]);
  const unread = await prisma.notification.count({
    where: { user_id: Number(user.id), is_read: false },
  });
  return (
    <DashboardShell title="Administrator" name={user.name || "Admin"} unread={unread} items={adminNav}>
      {children}
    </DashboardShell>
  );
}
