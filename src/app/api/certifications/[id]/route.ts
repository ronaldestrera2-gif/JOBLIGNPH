import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { removeUpload } from "@/lib/uploads";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const gate = await requireApiSession([ROLES.JOB_SEEKER]);
  if ("error" in gate && gate.error) return gate.error;

  const { id } = await context.params;
  const certId = Number(id);

  const seeker = await prisma.jobSeeker.findUnique({
    where: { user_id: Number(gate.user!.id) },
  });
  if (!seeker) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const cert = await prisma.certificationFile.findUnique({
    where: { cert_id: certId },
  });

  if (!cert || cert.seeker_id !== seeker.seeker_id) {
    return NextResponse.json({ error: "Certification not found." }, { status: 404 });
  }

  const path = cert.file_path.replace(/^\/uploads\//, "");
  await removeUpload(path);

  await prisma.certificationFile.delete({
    where: { cert_id: certId },
  });

  return NextResponse.json({ ok: true });
}