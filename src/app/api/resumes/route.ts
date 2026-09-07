import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { saveUpload, resumeUploadOptions } from "@/lib/uploads";

export async function GET() {
  const gate = await requireApiSession([ROLES.JOB_SEEKER]);
  if ("error" in gate && gate.error) return gate.error;
  const seeker = await prisma.jobSeeker.findUnique({
    where: { user_id: Number(gate.user!.id) },
  });
  if (!seeker) return NextResponse.json({ resumes: [] });
  const resumes = await prisma.resume.findMany({
    where: { seeker_id: seeker.seeker_id },
    orderBy: { uploaded_at: "desc" },
  });
  return NextResponse.json({ resumes });
}

export async function POST(req: Request) {
  const gate = await requireApiSession([ROLES.JOB_SEEKER]);
  if ("error" in gate && gate.error) return gate.error;
  const seeker = await prisma.jobSeeker.findUnique({
    where: { user_id: Number(gate.user!.id) },
  });
  if (!seeker) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

  const form = await req.formData();
  const file = form.get("file");
  const replaceId = form.get("replace_id");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Please choose a resume file to upload." }, { status: 400 });
  }

  try {
    const saved = await saveUpload(
      file,
      "resumes",
      resumeUploadOptions.allowed,
      resumeUploadOptions.maxBytes,
    );

    if (replaceId) {
      const existing = await prisma.resume.findFirst({
        where: { resume_id: Number(replaceId), seeker_id: seeker.seeker_id },
      });
      if (!existing) {
        return NextResponse.json({ error: "Resume not found." }, { status: 404 });
      }
      const updated = await prisma.resume.update({
        where: { resume_id: existing.resume_id },
        data: { file_name: saved.fileName, file_path: saved.relativePath },
      });
      return NextResponse.json({ resume: updated });
    }

    const resume = await prisma.resume.create({
      data: {
        seeker_id: seeker.seeker_id,
        file_name: saved.fileName,
        file_path: saved.relativePath,
      },
    });
    return NextResponse.json({ resume }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid file upload." },
      { status: 400 },
    );
  }
}
