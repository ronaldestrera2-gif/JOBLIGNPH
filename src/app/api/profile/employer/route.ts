import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { employerProfileSchema } from "@/lib/validations";
import { saveUpload, logoUploadOptions } from "@/lib/uploads";

export async function GET() {
  const gate = await requireApiSession([ROLES.EMPLOYER]);
  if ("error" in gate && gate.error) return gate.error;

  const employer = await prisma.employer.findUnique({
    where: { user_id: Number(gate.user!.id) },
    include: { companyProfile: true, user: true },
  });

  if (!employer) {
    return NextResponse.json({ error: "Company profile not found." }, { status: 404 });
  }

  return NextResponse.json({
    profile: {
      ...employer,
      user: {
        first_name: employer.user.first_name,
        last_name: employer.user.last_name,
        email: employer.user.email,
      },
    },
  });
}

export async function PATCH(req: Request) {
  const gate = await requireApiSession([ROLES.EMPLOYER]);
  if ("error" in gate && gate.error) return gate.error;

  const contentType = req.headers.get("content-type") || "";

  const employer = await prisma.employer.findUnique({
    where: { user_id: Number(gate.user!.id) },
    include: { companyProfile: true },
  });

  if (!employer) {
    return NextResponse.json({ error: "Company profile not found." }, { status: 404 });
  }

  // Handle Logo Upload
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const logo = form.get("logo");

    if (logo instanceof File && logo.size > 0) {
      const saved = await saveUpload(
        logo,
        "logos",
        logoUploadOptions.allowed,
        logoUploadOptions.maxBytes
      );

      const logoPath = `/uploads/${saved.relativePath}`;

      await prisma.companyProfile.upsert({
        where: { employer_id: employer.employer_id },
        update: { logo_path: logoPath },
        create: {
          employer_id: employer.employer_id,
          logo_path: logoPath,
        },
      });

      return NextResponse.json({ ok: true, logo_path: logoPath });
    }

    return NextResponse.json({ ok: true });
  }

  // Handle normal profile update (JSON)
  const parsed = employerProfileSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check your company details." },
      { status: 400 }
    );
  }

  await prisma.employer.update({
    where: { employer_id: employer.employer_id },
    data: {
      company_name: parsed.data.company_name,
      company_description: parsed.data.company_description || null,
      company_location: parsed.data.company_location || null,
      industry: parsed.data.industry || null,
      contact_number: parsed.data.contact_number || null,
    },
  });

  await prisma.companyProfile.upsert({
    where: { employer_id: employer.employer_id },
    update: {
      website: parsed.data.website || null,
      company_size: parsed.data.company_size || null,
    },
    create: {
      employer_id: employer.employer_id,
      website: parsed.data.website || null,
      company_size: parsed.data.company_size || null,
    },
  });

  return NextResponse.json({ ok: true });
}