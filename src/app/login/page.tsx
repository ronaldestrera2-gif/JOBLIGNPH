"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert, Button, Input, Label } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError(
          "Invalid email or password, or this account is not active."
        );
        setLoading(false);
        return;
      }

      const response = await fetch("/api/auth/session");
      const session = await response.json();

      if (session?.user?.role === "admin") {
        router.push("/admin");
      } else if (session?.user?.role === "employer") {
        router.push("/employer");
      } else if (session?.user?.role === "job_seeker") {
        router.push("/seeker");
      } else {
        setError("Your account has an invalid role.");
        setLoading(false);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong while logging in.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      
      {/* Back Button - Top Left */}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-white border border-line px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-brand"
        >
          ← Back
        </Link>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-semibold text-brand">
          Sign in to JobLign PH
        </h1>

        <p className="mt-2 text-center text-sm text-muted">
          Use your registered email and password.
        </p>

        {error ? (
          <div className="mt-4">
            <Alert>{error}</Alert>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-brand hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}