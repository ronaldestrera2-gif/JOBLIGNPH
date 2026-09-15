import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { saveUpload, certUploadOptions } from "@/lib/uploads";

export async function GET() {
  const gate = await requireApiSession([ROLES.JOB_SEEKER]);
  if ("error" in gate && gate.error) return gate.error;

  const seeker = await prisma.jobSeeker.findUnique({
    where: { user_id: Number(gate.user!.id) },
  });

  if (!seeker) {
    return NextResponse.json({ certifications: [] });
  }

  const certifications = await prisma.certificationFile.findMany({
    where: { seeker_id: seeker.seeker_id },
    orderBy: { uploaded_at: "desc" },
  });

  return NextResponse.json({ certifications });
}

export async function POST(req: Request) {
  try {
    const gate = await requireApiSession([ROLES.JOB_SEEKER]);
    if ("error" in gate && gate.error) return gate.error;

    const seeker = await prisma.jobSeeker.findUnique({
      where: { user_id: Number(gate.user!.id) },
    });

    if (!seeker) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const form = await req.formData();
    const file = form.get("certification");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Please choose a certification file." },
        { status: 400 },
      );
    }

    const saved = await saveUpload(
      file,
      "certifications",
      certUploadOptions.allowed,
      certUploadOptions.maxBytes,
    );

    const cert = await prisma.certificationFile.create({
      data: {
        seeker_id: seeker.seeker_id,
        file_name: saved.fileName,
        file_path: saved.relativePath, // cloud URL
      },
    });

    return NextResponse.json({ ok: true, certification: cert }, { status: 201 });
  } catch (error: any) {
    console.error("Certification upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Upload failed." },
      { status: 400 },
    );
  }
}