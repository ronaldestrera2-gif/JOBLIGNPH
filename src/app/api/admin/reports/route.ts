import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";

export async function GET() {
  const gate = await requireApiSession([ROLES.ADMIN]);
  if ("error" in gate && gate.error) return gate.error;

  const [
    users,
    seekers,
    employers,
    jobs,
    applications,
    pending,
    statusGroups,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: ROLES.JOB_SEEKER } }),
    prisma.user.count({ where: { role: ROLES.EMPLOYER } }),
    prisma.jobPosting.count(),
    prisma.application.count(),
    prisma.employer.count({ where: { verification_status: "pending" } }),
    prisma.application.groupBy({ by: ["status"], _count: true }),
  ]);

  return NextResponse.json({
    totals: {
      users,
      job_seekers: seekers,
      employers,
      job_postings: jobs,
      applications,
      pending_verifications: pending,
    },
    application_status: Object.fromEntries(
      statusGroups.map((s) => [s.status, s._count]),
    ),
  });
}
