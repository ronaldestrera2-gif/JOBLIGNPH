import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { userStatusSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const gate = await requireApiSession([ROLES.ADMIN]);
  if ("error" in gate && gate.error) return gate.error;
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const role = req.nextUrl.searchParams.get("role")?.trim();
  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role } : {}),
      ...(q
        ? {
            OR: [
              { first_name: { contains: q } },
              { last_name: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : {}),
    },
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
  const gate = await requireApiSession([ROLES.ADMIN]);
  if ("error" in gate && gate.error) return gate.error;
  const body = await req.json();
  const parsed = userStatusSchema.safeParse({ status: body.status });
  if (!parsed.success || !body.user_id) {
    return NextResponse.json({ error: "Invalid user update." }, { status: 400 });
  }
  if (Number(body.user_id) === Number(gate.user!.id)) {
    return NextResponse.json({ error: "You cannot change your own account status here." }, { status: 400 });
  }
  await prisma.user.update({
    where: { user_id: Number(body.user_id) },
    data: { status: parsed.data.status },
  });
  return NextResponse.json({ ok: true });
}
