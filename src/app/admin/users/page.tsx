import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { Card, Input, Select } from "@/components/ui";
import { StatusBadge } from "@/components/status";
import { UserStatusActions } from "@/components/user-status-actions";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  await requirePageSession([ROLES.ADMIN]);
  const { q, role } = await searchParams;

  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role } : {}),
      ...(q
        ? {
            OR: [
              { first_name: { contains: q } },
              { last_name: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : {}),
    },
    select: {
      user_id: true,
      first_name: true,
      last_name: true,
      email: true,
      role: true,
      status: true,
      jobSeeker: {
        select: { seeker_id: true },
      },
      employer: {
        select: { employer_id: true },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">User management</h1>

      <form className="grid gap-2 md:grid-cols-3">
        <Input name="q" placeholder="Search name or email" defaultValue={q} />
        <Select name="role" defaultValue={role || ""}>
          <option value="">All roles</option>
          <option value="job_seeker">Job Seeker</option>
          <option value="employer">Employer</option>
          <option value="admin">Administrator</option>
        </Select>
        <button className="rounded-lg bg-brand px-4 py-2 text-sm text-white">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              let profileHref: string | null = null;

              if (u.role === "job_seeker" && u.jobSeeker) {
                profileHref = `/profile/seeker/${u.jobSeeker.seeker_id}`;
              } else if (u.role === "employer" && u.employer) {
                profileHref = `/profile/company/${u.employer.employer_id}`;
              }

              return (
                <tr key={u.user_id} className="border-t border-line">
                  <td className="p-3">
                    {profileHref ? (
                      <Link
                        href={profileHref}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {u.first_name} {u.last_name}
                      </Link>
                    ) : (
                      <span>
                        {u.first_name} {u.last_name}
                      </span>
                    )}
                  </td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <StatusBadge value={u.role} />
                  </td>
                  <td className="p-3">
                    <StatusBadge value={u.status} />
                  </td>
                  <td className="p-3">
                    <UserStatusActions userId={u.user_id} status={u.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}