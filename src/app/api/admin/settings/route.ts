import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { settingsSchema } from "@/lib/validations";

export async function GET() {
  const gate = await requireApiSession([ROLES.ADMIN]);
  if ("error" in gate && gate.error) return gate.error;
  const rows = await prisma.systemSetting.findMany();
  return NextResponse.json({
    settings: Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value])),
  });
}

export async function PATCH(req: Request) {
  const gate = await requireApiSession([ROLES.ADMIN]);
  if ("error" in gate && gate.error) return gate.error;
  const parsed = settingsSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings." }, { status: 400 });
  }
  await prisma.systemSetting.upsert({
    where: { setting_key: "require_employer_verification" },
    update: { setting_value: parsed.data.require_employer_verification },
    create: {
      setting_key: "require_employer_verification",
      setting_value: parsed.data.require_employer_verification,
    },
  });
  if (parsed.data.platform_name) {
    await prisma.systemSetting.upsert({
      where: { setting_key: "platform_name" },
      update: { setting_value: parsed.data.platform_name },
      create: { setting_key: "platform_name", setting_value: parsed.data.platform_name },
    });
  }
  return NextResponse.json({ ok: true });
}
