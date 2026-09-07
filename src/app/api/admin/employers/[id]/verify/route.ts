import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { NOTIFICATION_TYPES, ROLES } from "@/lib/constants";
import { verificationSchema } from "@/lib/validations";
import { notifyUser } from "@/lib/notifications";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const gate = await requireApiSession([ROLES.ADMIN]);
  if ("error" in gate && gate.error) return gate.error;
  const parsed = verificationSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid verification decision." }, { status: 400 });
  }
  const { id } = await context.params;
  const employer = await prisma.employer.update({
    where: { employer_id: Number(id) },
    data: {
      verification_status: parsed.data.verification_status,
      verified_by: Number(gate.user!.id),
      verified_at: new Date(),
      verification_notes: parsed.data.notes || null,
    },
  });
  await notifyUser({
    userId: employer.user_id,
    title: "Employer verification update",
    message:
      parsed.data.verification_status === "verified"
        ? "Your company has been verified. You may now publish job postings."
        : "Your company verification was rejected. Please update your profile and wait for another review.",
    type: NOTIFICATION_TYPES.EMPLOYER_VERIFICATION,
  });
  return NextResponse.json({ ok: true });
}
