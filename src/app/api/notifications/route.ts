import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/authz";

export async function GET() {
  const gate = await requireApiSession();
  if ("error" in gate && gate.error) return gate.error;
  const notifications = await prisma.notification.findMany({
    where: { user_id: Number(gate.user!.id) },
    orderBy: { created_at: "desc" },
    take: 50,
  });
  return NextResponse.json({ notifications });
}

export async function PATCH(req: Request) {
  const gate = await requireApiSession();
  if ("error" in gate && gate.error) return gate.error;
  const body = await req.json();
  if (body.all) {
    await prisma.notification.updateMany({
      where: { user_id: Number(gate.user!.id) },
      data: { is_read: true },
    });
    return NextResponse.json({ ok: true });
  }
  const id = Number(body.notification_id);
  await prisma.notification.updateMany({
    where: { notification_id: id, user_id: Number(gate.user!.id) },
    data: { is_read: true },
  });
  return NextResponse.json({ ok: true });
}
