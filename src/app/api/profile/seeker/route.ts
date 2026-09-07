import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { syncSeekerSkills } from "@/lib/skills";
import { refreshSeekerRecommendations } from "@/lib/matching-service";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  const gate = await requireApiSession([ROLES.JOB_SEEKER]);
  if ("error" in gate && gate.error) return gate.error;

  const seeker = await prisma.jobSeeker.findUnique({
    where: { user_id: Number(gate.user!.id) },
    include: {
      user: true,
      seekerSkills: { include: { skill: true } },
      resumes: { orderBy: { uploaded_at: "desc" } },
    },
  });

  if (!seeker) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const { user, ...rest } = seeker;

  return NextResponse.json({
    profile: {
      ...rest,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      skills: seeker.seekerSkills.map((s) => s.skill.skill_name),
    },
  });
}

export async function PATCH(req: Request) {
  const gate = await requireApiSession([ROLES.JOB_SEEKER]);
  if ("error" in gate && gate.error) return gate.error;

  const formData = await req.formData();

  const first_name = formData.get("first_name") as string;
  const last_name = formData.get("last_name") as string;
  const headline = formData.get("headline") as string;
  const education = formData.get("education") as string;
  const work_experience = formData.get("work_experience") as string;
  const experience_years = formData.get("experience_years")
    ? Number(formData.get("experience_years"))
    : null;
  const location = formData.get("location") as string;
  const employment_type_preference = formData.get("employment_type_preference") as string;
  const availability = formData.get("availability") as string;
  const certifications = formData.get("certifications") as string;
  const other_qualifications = formData.get("other_qualifications") as string;
  const skillsRaw = formData.get("skills") as string;
  const skills = skillsRaw
    ? skillsRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const seeker = await prisma.jobSeeker.findUnique({
    where: { user_id: Number(gate.user!.id) },
  });

  if (!seeker) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  // Handle Profile Picture Upload
  let profilePicturePath = seeker.profile_picture;

  const file = formData.get("profile_picture") as File | null;

  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");
    await mkdir(uploadDir, { recursive: true });

    const filename = `seeker_${seeker.seeker_id}_${Date.now()}${path.extname(file.name)}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    profilePicturePath = `/uploads/profiles/${filename}`;
  }

  // Update User name
  await prisma.user.update({
    where: { user_id: Number(gate.user!.id) },
    data: {
      first_name,
      last_name,
    },
  });

  // Update Seeker profile
  await prisma.jobSeeker.update({
    where: { seeker_id: seeker.seeker_id },
    data: {
      headline: headline || null,
      education: education || null,
      work_experience: work_experience || null,
      experience_years,
      location: location || null,
      employment_type_preference: employment_type_preference || null,
      availability: availability || null,
      certifications: certifications || null,
      other_qualifications: other_qualifications || null,
      profile_picture: profilePicturePath,
    },
  });

  await syncSeekerSkills(seeker.seeker_id, skills);
  await refreshSeekerRecommendations(seeker.seeker_id);

  return NextResponse.json({ ok: true });
}