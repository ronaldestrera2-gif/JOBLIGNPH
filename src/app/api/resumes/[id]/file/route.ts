import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const gate = await requireApiSession();
  if ("error" in gate && gate.error) return gate.error;

  const { id } = await context.params;
  const resume = await prisma.resume.findUnique({
    where: { resume_id: Number(id) },
    include: {
      jobSeeker: true,
      applications: { include: { jobPosting: true } },
    },
  });

  if (!resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  const userId = Number(gate.user!.id);

  if (gate.user!.role === ROLES.JOB_SEEKER) {
    if (resume.jobSeeker.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }
  } else if (gate.user!.role === ROLES.EMPLOYER) {
    const employer = await prisma.employer.findUnique({
      where: { user_id: userId },
    });
    const allowed = resume.applications.some(
      (a) => a.jobPosting.employer_id === employer?.employer_id,
    );
    if (!allowed) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }
  } else if (gate.user!.role !== ROLES.ADMIN) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  // Cloud URL redirect
  if (resume.file_path.startsWith("http")) {
    return NextResponse.redirect(resume.file_path);
  }

  return NextResponse.json(
    { error: "File is not available in cloud storage." },
    { status: 404 },
  );
}