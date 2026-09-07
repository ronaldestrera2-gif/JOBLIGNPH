import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { removeUpload } from "@/lib/uploads";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const gate = await requireApiSession([ROLES.JOB_SEEKER]);
  if ("error" in gate && gate.error) return gate.error;
  const seeker = await prisma.jobSeeker.findUnique({
    where: { user_id: Number(gate.user!.id) },
  });
  if (!seeker) return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  const { id } = await context.params;
  const resume = await prisma.resume.findFirst({
    where: { resume_id: Number(id), seeker_id: seeker.seeker_id },
  });
  if (!resume) return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  await prisma.resume.delete({ where: { resume_id: resume.resume_id } });
  await removeUpload(resume.file_path);
  return NextResponse.json({ ok: true });
}
