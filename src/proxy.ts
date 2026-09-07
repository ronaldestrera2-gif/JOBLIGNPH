import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { ROLES } from "@/lib/constants";
import { dashboardPath } from "@/lib/auth";

const protectedPrefixes = ["/seeker", "/employer", "/admin", "/dashboard", "/messages"];

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = protectedPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isProtected) return NextResponse.next();

  if (!req.auth?.user) {
    const login = new URL("/login", req.nextUrl);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  const role = req.auth.user.role;
  if (pathname.startsWith("/seeker") && role !== ROLES.JOB_SEEKER) {
    return NextResponse.redirect(new URL(dashboardPath(role), req.nextUrl));
  }
  if (pathname.startsWith("/employer") && role !== ROLES.EMPLOYER) {
    return NextResponse.redirect(new URL(dashboardPath(role), req.nextUrl));
  }
  if (pathname.startsWith("/admin") && role !== ROLES.ADMIN) {
    return NextResponse.redirect(new URL(dashboardPath(role), req.nextUrl));
  }

  return NextResponse.next();
});

export default proxy;

export const config = {
  matcher: ["/seeker/:path*", "/employer/:path*", "/admin/:path*", "/dashboard", "/messages/:path*"],
};
