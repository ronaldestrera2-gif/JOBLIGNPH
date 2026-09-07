import { prisma } from "@/lib/prisma";
import { calculateMatchScore } from "@/lib/matching";
import { notifyUser } from "@/lib/notifications";
import { NOTIFICATION_TYPES } from "@/lib/constants";

export async function matchSeekerToJob(seekerId: number, jobId: number) {
  const [seeker, job] = await Promise.all([
    prisma.jobSeeker.findUnique({
      where: { seeker_id: seekerId },
      include: { seekerSkills: { include: { skill: true } } },
    }),
    prisma.jobPosting.findUnique({
      where: { job_id: jobId },
      include: { jobSkills: { include: { skill: true } } },
    }),
  ]);

  if (!seeker || !job) return null;

  const result = calculateMatchScore({
    candidateSkills: seeker.seekerSkills.map((s) => s.skill.skill_name),
    requiredSkills: job.jobSkills.map((s) => s.skill.skill_name),
  });

  const record = await prisma.jobMatching.upsert({
    where: {
      seeker_id_job_id: { seeker_id: seekerId, job_id: jobId },
    },
    update: {
      match_score: result.matchScore,
      matched_skills: JSON.stringify(result.matchingSkills),
      missing_skills: JSON.stringify(result.missingSkills),
    },
    create: {
      seeker_id: seekerId,
      job_id: jobId,
      match_score: result.matchScore,
      matched_skills: JSON.stringify(result.matchingSkills),
      missing_skills: JSON.stringify(result.missingSkills),
    },
  });

  return { ...result, record };
}

export async function refreshSeekerRecommendations(seekerId: number) {
  const jobs = await prisma.jobPosting.findMany({
    where: { status: "active" },
    select: { job_id: true, job_title: true, employer: { select: { company_name: true } } },
  });

  const scored = [];
  for (const job of jobs) {
    const match = await matchSeekerToJob(seekerId, job.job_id);
    if (match) scored.push({ job, match });
  }

  const top = scored
    .filter((s) => s.match.matchScore >= 50)
    .sort((a, b) => b.match.matchScore - a.match.matchScore)
    .slice(0, 3);

  const seeker = await prisma.jobSeeker.findUnique({ where: { seeker_id: seekerId } });
  if (seeker && top.length) {
    await notifyUser({
      userId: seeker.user_id,
      title: "New job recommendations",
      message: `We found ${top.length} roles that match your skills, including ${top[0].job.job_title} at ${top[0].job.employer.company_name}. Match scores are recommendations only and do not guarantee employment.`,
      type: NOTIFICATION_TYPES.JOB_RECOMMENDATION,
    });
  }

  return scored;
}

export async function getSetting(key: string, fallback = "") {
  const row = await prisma.systemSetting.findUnique({ where: { setting_key: key } });
  return row?.setting_value ?? fallback;
}
