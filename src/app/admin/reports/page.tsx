import { prisma } from "@/lib/prisma";
import { requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { Card } from "@/components/ui";

export default async function AdminReportsPage() {
  await requirePageSession([ROLES.ADMIN]);
  const [users, seekers, employers, jobs, applications, groups] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "job_seeker" } }),
    prisma.user.count({ where: { role: "employer" } }),
    prisma.jobPosting.count(),
    prisma.application.count(),
    prisma.application.groupBy({ by: ["status"], _count: true }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Reports</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Registered users", users],
          ["Job seekers", seekers],
          ["Employers", employers],
          ["Job postings", jobs],
          ["Applications", applications],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <p className="text-sm text-muted">{label}</p>
            <p className="text-3xl font-semibold">{value}</p>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="font-semibold">Application status statistics</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {groups.map((g) => (
            <li key={g.status} className="flex justify-between">
              <span className="capitalize">{g.status}</span>
              <span>{g._count}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
