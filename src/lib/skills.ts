import { prisma } from "@/lib/prisma";

export async function findOrCreateSkill(name: string, category?: string) {
  const skill_name = name.trim();
  const existing = await prisma.skill.findFirst({
    where: { skill_name: { equals: skill_name } },
  });
  if (existing) return existing;
  return prisma.skill.create({
    data: { skill_name, category: category ?? "General" },
  });
}

export async function syncSeekerSkills(seekerId: number, skillNames: string[]) {
  const unique = [...new Set(skillNames.map((s) => s.trim()).filter(Boolean))];
  const skills = await Promise.all(unique.map((name) => findOrCreateSkill(name)));
  await prisma.seekerSkill.deleteMany({ where: { seeker_id: seekerId } });
  if (skills.length) {
    await prisma.seekerSkill.createMany({
      data: skills.map((s) => ({ seeker_id: seekerId, skill_id: s.skill_id })),
    });
  }
}

export async function syncJobSkills(
  jobId: number,
  items: { skill_name: string; required_level?: string }[],
) {
  await prisma.jobSkill.deleteMany({ where: { job_id: jobId } });
  for (const item of items) {
    const skill = await findOrCreateSkill(item.skill_name);
    await prisma.jobSkill.create({
      data: {
        job_id: jobId,
        skill_id: skill.skill_id,
        required_level: item.required_level ?? "intermediate",
      },
    });
  }
}
