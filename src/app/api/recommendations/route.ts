import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { matchSeekerToJob } from "@/lib/matching-service";
import { formatPesoRange, isExpired } from "@/lib/utils";

export async function GET() {
  const gate = await requireApiSession([ROLES.JOB_SEEKER]);
  if ("error" in gate && gate.error) return gate.error;
  const seeker = await prisma.jobSeeker.findUnique({
    where: { user_id: Number(gate.user!.id) },
  });
  if (!seeker) return NextResponse.json({ recommendations: [] });

  const jobs = await prisma.jobPosting.findMany({
    where: { status: "active" },
    include: {
      employer: true,
      jobSkills: { include: { skill: true } },
    },
  });

  const recommendations = [];
  for (const job of jobs) {
    if (isExpired(job.deadline)) continue;
    const match = await matchSeekerToJob(seeker.seeker_id, job.job_id);
    if (!match) continue;
    recommendations.push({
      job_id: job.job_id,
      job_title: job.job_title,
      company: job.employer.company_name,
      location: job.location,
      employment_type: job.employment_type,
      salary_range: formatPesoRange(job.salary_min, job.salary_max, job.salary_range),
      deadline: job.deadline,
      matchScore: match.matchScore,
      matchingSkills: match.matchingSkills,
      missingSkills: match.missingSkills,
    });
  }

  recommendations.sort((a, b) => b.matchScore - a.matchScore);
  return NextResponse.json({
    recommendations,
    disclaimer:
      "Match scores are recommendations only and do not guarantee employment or a hiring decision.",
  });
}
