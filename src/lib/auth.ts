import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { ROLES } from "@/lib/constants";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    Credentials({
      name: "credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: parsed.data.email.toLowerCase(),
          },
        });

        if (!user) {
          return null;
        }

        if (user.status !== "active") {
          return null;
        }

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.password
        );

        if (!valid) {
          return null;
        }

        return {
          id: String(user.user_id),
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as string) ?? "";
      }

      return session;
    },
  },
});

export function dashboardPath(role?: string | null) {
  if (role === ROLES.ADMIN) {
    return "/admin";
  }

  if (role === ROLES.EMPLOYER) {
    return "/employer";
  }

  if (role === ROLES.JOB_SEEKER) {
    return "/seeker";
  }

  return "/login";
}