import { prisma } from "@/lib/prisma";
import { requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { Card } from "@/components/ui";
import Link from "next/link";

export default async function AdminHome() {
  await requirePageSession([ROLES.ADMIN]);

  const [
    users,
    seekers,
    employers,
    jobs,
    applications,
    pending,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { role: ROLES.JOB_SEEKER },
    }),
    prisma.user.count({
      where: { role: ROLES.EMPLOYER },
    }),
    prisma.jobPosting.count({
      where: { status: "active" },
    }),
    prisma.application.count(),
    prisma.employer.count({
      where: { verification_status: "pending" },
    }),
  ]);

  const tiles = [
    ["Total Users", users, "/admin/users"],
    ["Job Seekers", seekers, "/admin/users"],
    ["Employers", employers, "/admin/employers"],
    ["Active Jobs", jobs, "/admin/jobs"],
    ["Applications", applications, "/admin/applications"],
    ["Pending Verifications", pending, "/admin/employers"],
  ] as const;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">
        Administrator Dashboard
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map(([label, value, href]) => (
          <Link key={label} href={href}>
            <Card>
              <p className="text-sm text-muted">{label}</p>
              <p className="text-3xl font-semibold">{value}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}