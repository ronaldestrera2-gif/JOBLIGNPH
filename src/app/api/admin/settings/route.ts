import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { settingsSchema } from "@/lib/validations";

export async function GET() {
  await requireApiSession([ROLES.ADMIN]);

  const settings = await prisma.systemSetting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.setting_key] = s.setting_value;

  return NextResponse.json({ settings: map });
}

export async function PATCH(req: Request) {
  try {
    await requireApiSession([ROLES.ADMIN]);

    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid settings." },
        { status: 400 },
      );
    }

    if (parsed.data.require_employer_verification !== undefined) {
      const value =
        typeof parsed.data.require_employer_verification === "boolean"
          ? parsed.data.require_employer_verification
            ? "true"
            : "false"
          : String(parsed.data.require_employer_verification);

      await prisma.systemSetting.upsert({
        where: { setting_key: "require_employer_verification" },
        update: { setting_value: value },
        create: {
          setting_key: "require_employer_verification",
          setting_value: value,
        },
      });
    }

    if (parsed.data.platform_name !== undefined) {
      const value = String(parsed.data.platform_name);
      await prisma.systemSetting.upsert({
        where: { setting_key: "platform_name" },
        update: { setting_value: value },
        create: {
          setting_key: "platform_name",
          setting_value: value,
        },
      });
    }

    if (parsed.data.setting_key && parsed.data.setting_value !== undefined) {
      await prisma.systemSetting.upsert({
        where: { setting_key: parsed.data.setting_key },
        update: { setting_value: String(parsed.data.setting_value) },
        create: {
          setting_key: parsed.data.setting_key,
          setting_value: String(parsed.data.setting_value),
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Admin settings error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update settings." },
      { status: 500 },
    );
  }
}