import { prisma } from "@/lib/prisma";
import { requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { DashboardShell } from "@/components/dashboard-shell";
import { employerNav } from "@/lib/nav";

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePageSession([ROLES.EMPLOYER]);

  const employer = await prisma.employer.findUnique({
    where: { user_id: Number(user.id) },
  });

  const incomplete =
    !employer ||
    !employer.company_name ||
    !employer.company_location ||
    !employer.industry;

  const unread = await prisma.notification.count({
    where: { user_id: Number(user.id), is_read: false },
  });

  return (
    <DashboardShell
      title="Employer"
      name={user.name || "Employer"}
      unread={unread}
      items={employerNav}
    >
      {incomplete ? (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Please complete your company profile before posting jobs.
        </div>
      ) : null}
      {children}
    </DashboardShell>
  );
}