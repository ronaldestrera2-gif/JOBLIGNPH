import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { auth, dashboardPath } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES, type Role } from "@/lib/constants";

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requirePageSession(roles?: Role[]) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role as Role)) {
    redirect(dashboardPath(user.role));
  }
  return user;
}

export async function requireApiSession(roles?: Role[]) {
  const user = await getSessionUser();
  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Please sign in to continue." },
        { status: 401 },
      ),
    };
  }
  if (roles && !roles.includes(user.role as Role)) {
    return {
      error: NextResponse.json(
        { error: "You do not have permission to perform this action." },
        { status: 403 },
      ),
    };
  }
  return { user };
}

export async function getSeekerForUser(userId: number) {
  return prisma.jobSeeker.findUnique({
    where: { user_id: userId },
    include: {
      user: true,
      seekerSkills: { include: { skill: true } },
      resumes: { orderBy: { uploaded_at: "desc" } },
    },
  });
}

export async function getEmployerForUser(userId: number) {
  return prisma.employer.findUnique({
    where: { user_id: userId },
    include: { user: true, companyProfile: true },
  });
}

export function parseUserId(id: string) {
  return Number.parseInt(id, 10);
}

export { ROLES };
