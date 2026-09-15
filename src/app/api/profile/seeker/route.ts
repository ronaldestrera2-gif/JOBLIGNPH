import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { syncSeekerSkills } from "@/lib/skills";
import { refreshSeekerRecommendations } from "@/lib/matching-service";
import { saveUpload, logoUploadOptions } from "@/lib/uploads";

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
  try {
    const gate = await requireApiSession([ROLES.JOB_SEEKER]);
    if ("error" in gate && gate.error) return gate.error;

    const seeker = await prisma.jobSeeker.findUnique({
      where: { user_id: Number(gate.user!.id) },
    });

    if (!seeker) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const contentType = req.headers.get("content-type") || "";

    // Profile picture upload (cloud)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("profile_picture");

      if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json(
          { error: "Please choose a profile picture." },
          { status: 400 },
        );
      }

      const saved = await saveUpload(
        file,
        "profiles",
        logoUploadOptions.allowed,
        logoUploadOptions.maxBytes,
      );

      await prisma.jobSeeker.update({
        where: { seeker_id: seeker.seeker_id },
        data: { profile_picture: saved.relativePath },
      });

      return NextResponse.json({
        ok: true,
        profile_picture: saved.relativePath,
      });
    }

    // Profile details (JSON)
    const body = await req.json();

    const first_name = String(body.first_name || "").trim();
    const last_name = String(body.last_name || "").trim();

    if (!first_name || !last_name) {
      return NextResponse.json(
        { error: "First name and last name are required." },
        { status: 400 },
      );
    }

    const skills = Array.isArray(body.skills)
      ? body.skills.map((s: unknown) => String(s || "").trim()).filter(Boolean)
      : [];

    await prisma.user.update({
      where: { user_id: Number(gate.user!.id) },
      data: { first_name, last_name },
    });

    await prisma.jobSeeker.update({
      where: { seeker_id: seeker.seeker_id },
      data: {
        headline: body.headline ? String(body.headline) : null,
        education: body.education ? String(body.education) : null,
        work_experience: body.work_experience
          ? String(body.work_experience)
          : null,
        experience_years:
          body.experience_years === "" || body.experience_years == null
            ? null
            : Number(body.experience_years),
        location: body.location ? String(body.location) : null,
        employment_type_preference: body.employment_type_preference
          ? String(body.employment_type_preference)
          : null,
        availability: body.availability ? String(body.availability) : null,
        other_qualifications: body.other_qualifications
          ? String(body.other_qualifications)
          : null,
      },
    });

    await syncSeekerSkills(seeker.seeker_id, skills);
    await refreshSeekerRecommendations(seeker.seeker_id);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Seeker profile update error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error while updating profile." },
      { status: 500 },
    );
  }
}