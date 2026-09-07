import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { ROLES } from "@/lib/constants";
import { notifyUser } from "@/lib/notifications";
import { NOTIFICATION_TYPES } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." },
        { status: 400 },
      );
    }

    const { first_name, last_name, email, password, role, company_name } = parsed.data;

    if (role === ROLES.EMPLOYER && !company_name?.trim()) {
      return NextResponse.json(
        { error: "Company name is required for employer accounts." },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json({ error: "Email already registered." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        first_name,
        last_name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
      },
    });

    if (role === ROLES.JOB_SEEKER) {
      await prisma.jobSeeker.create({ data: { user_id: user.user_id } });
    } else if (role === ROLES.EMPLOYER) {
      const employer = await prisma.employer.create({
        data: {
          user_id: user.user_id,
          company_name: company_name!.trim(),
          verification_status: "pending",
        },
      });
      await prisma.companyProfile.create({ data: { employer_id: employer.employer_id } });
      await notifyUser({
        userId: user.user_id,
        title: "Employer verification pending",
        message:
          "Your company registration is pending administrator review. You can prepare your profile, but publishing jobs may require verification.",
        type: NOTIFICATION_TYPES.EMPLOYER_VERIFICATION,
      });
    }

    return NextResponse.json({ message: "Account created successfully." }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "We could not create your account. Please try again." },
      { status: 500 },
    );
  }
}
