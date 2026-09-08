import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { resolveUpload } from "@/lib/uploads";

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
      applications: {
        include: { jobPosting: true },
      },
    },
  });

  if (!resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  const userId = Number(gate.user!.id);

  // Job Seeker can only view their own resume
  if (gate.user!.role === ROLES.JOB_SEEKER) {
    if (resume.jobSeeker.user_id !== userId) {
      return NextResponse.json(
        { error: "You can only access your own resume." },
        { status: 403 }
      );
    }
  }

  // Employer can view resume if the seeker applied to any of their jobs
  else if (gate.user!.role === ROLES.EMPLOYER) {
    const employer = await prisma.employer.findUnique({
      where: { user_id: userId },
    });

    if (!employer) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    // Check if this seeker has any application to this employer's jobs
    const hasApplication = await prisma.application.findFirst({
      where: {
        seeker_id: resume.seeker_id,
        jobPosting: {
          employer_id: employer.employer_id,
        },
      },
    });

    if (!hasApplication) {
      return NextResponse.json(
        { error: "You can only view resumes of applicants to your jobs." },
        { status: 403 }
      );
    }
  }

  // Admin can view any resume
  else if (gate.user!.role !== ROLES.ADMIN) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  // Serve the file
  try {
    const file = await readFile(resolveUpload(resume.file_path));
    const ext = path.extname(resume.file_name).toLowerCase();

    const type =
      ext === ".pdf"
        ? "application/pdf"
        : ext === ".docx"
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/octet-stream";

    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": type,
        "Content-Disposition": `inline; filename="${resume.file_name}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "The resume file is not available." },
      { status: 404 }
    );
  }
}