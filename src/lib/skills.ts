import { prisma } from "@/lib/prisma";

export async function findOrCreateSkill(name: string, category?: string) {
  const skill_name = String(name || "").trim();
  if (!skill_name) {
    throw new Error("Skill name is required.");
  }

  const existing = await prisma.skill.findFirst({
    where: {
      skill_name: {
        equals: skill_name,
        mode: "insensitive",
      },
    },
  });

  if (existing) return existing;

  return prisma.skill.create({
    data: {
      skill_name,
      category: category || null,
    },
  });
}

export async function syncJobSkills(
  jobId: number,
  skills: Array<string | { name?: string; skill?: string; level?: string }>
) {
  // Clean skills into plain strings
  const cleaned = (skills || [])
    .map((s) => {
      if (typeof s === "string") return s.trim();
      if (s && typeof s === "object") {
        return String(s.name || s.skill || "").trim();
      }
      return "";
    })
    .filter(Boolean);

  // Remove old links
  await prisma.jobSkill.deleteMany({
    where: { job_id: jobId },
  });

  // Add new links
  for (const skillName of cleaned) {
    const skill = await findOrCreateSkill(skillName);
    await prisma.jobSkill.create({
      data: {
        job_id: jobId,
        skill_id: skill.skill_id,
        required_level: "required",
      },
    });
  }
}

export async function syncSeekerSkills(seekerId: number, skills: string[]) {
  const cleaned = (skills || [])
    .map((s) => String(s || "").trim())
    .filter(Boolean);

  await prisma.seekerSkill.deleteMany({
    where: { seeker_id: seekerId },
  });

  for (const skillName of cleaned) {
    const skill = await findOrCreateSkill(skillName);
    await prisma.seekerSkill.create({
      data: {
        seeker_id: seekerId,
        skill_id: skill.skill_id,
      },
    });
  }
}