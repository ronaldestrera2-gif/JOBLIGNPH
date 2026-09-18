import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { userStatusSchema } from "@/lib/validations";

export async function GET() {
  await requireApiSession([ROLES.ADMIN]);
  const users = await prisma.user.findMany({
    select: {
      user_id: true,
      first_name: true,
      last_name: true,
      email: true,
      role: true,
      status: true,
      created_at: true,
    },
    orderBy: { created_at: "desc" },
  });
  return NextResponse.json({ users });
}

export async function PATCH(req: Request) {
  try {
    const gate = await requireApiSession([ROLES.ADMIN]);
    if ("error" in gate && gate.error) return gate.error;

    const body = await req.json();
    const parsed = userStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request." },
        { status: 400 },
      );
    }

    // prevent admin suspending themselves
    if (Number(gate.user!.id) === parsed.data.user_id) {
      return NextResponse.json(
        { error: "You cannot change your own account status." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { user_id: parsed.data.user_id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.role === ROLES.ADMIN) {
      return NextResponse.json(
        { error: "Admin accounts cannot be suspended here." },
        { status: 400 },
      );
    }

    const updated = await prisma.user.update({
      where: { user_id: parsed.data.user_id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({
      ok: true,
      user: {
        user_id: updated.user_id,
        status: updated.status,
      },
    });
  } catch (error: any) {
    console.error("Admin user status error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update user status." },
      { status: 500 },
    );
  }
}