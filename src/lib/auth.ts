import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";

export function dashboardPath(role?: string | null) {
  switch (role) {
    case ROLES.ADMIN:
      return "/admin";
    case ROLES.EMPLOYER:
      return "/employer";
    case ROLES.JOB_SEEKER:
      return "/seeker";
    default:
      return "/";
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password || "");

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;
        if (user.status && user.status !== "active") return null;

        // Google-only accounts may have empty random password marker
        if (!user.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: String(user.user_id),
          email: user.email,
          name: `${user.first_name} ${user.last_name}`.trim(),
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Credentials already validated in authorize()
      if (account?.provider === "credentials") return true;

      // Google login: create local user if needed
      if (account?.provider === "google") {
        const email = String(user.email || profile?.email || "")
          .trim()
          .toLowerCase();

        if (!email) return false;

        const existing = await prisma.user.findUnique({
          where: { email },
        });

        if (existing) {
          if (existing.status && existing.status !== "active") return false;
          return true;
        }

        const fullName = String(user.name || "Google User").trim();
        const [first, ...rest] = fullName.split(" ");
        const first_name = first || "Google";
        const last_name = rest.join(" ") || "User";

        // Default Google signups as job seekers
        const created = await prisma.user.create({
          data: {
            first_name,
            last_name,
            email,
            password: await bcrypt.hash(
              `google_${Date.now()}_${Math.random()}`,
              10,
            ),
            role: ROLES.JOB_SEEKER,
            status: "active",
            jobSeeker: {
              create: {},
            },
          },
        });

        user.id = String(created.user_id);
        (user as any).role = created.role;
        return true;
      }

      return true;
    },

    async jwt({ token, user, account }) {
      // On first sign-in
      if (user) {
        // Prefer DB role by email for Google
        if (user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: String(user.email).toLowerCase() },
          });
          if (dbUser) {
            token.id = String(dbUser.user_id);
            token.role = dbUser.role;
            token.name = `${dbUser.first_name} ${dbUser.last_name}`.trim();
            token.email = dbUser.email;
            return token;
          }
        }

        token.id = user.id;
        token.role = (user as any).role || ROLES.JOB_SEEKER;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id || token.sub || "");
        (session.user as any).role = token.role || ROLES.JOB_SEEKER;
        if (token.name) session.user.name = String(token.name);
        if (token.email) session.user.email = String(token.email);
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
});