"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Alert, Button, Input, Label, Select } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "job_seeker",
    company_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed.");
        setLoading(false);
        return;
      }
      router.push("/login");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
      
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
          Create your JobLign PH account
        </h1>

        {error ? (
          <div className="mt-4">
            <Alert>{error}</Alert>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label>First name</Label>
            <Input
              name="first_name"
              required
              value={formData.first_name}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Last name</Label>
            <Input
              name="last_name"
              required
              value={formData.last_name}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Password</Label>
            <Input
              type="password"
              name="password"
              required
              minLength={8}
              value={formData.password}
              onChange={handleChange}
            />
            <p className="mt-1 text-xs text-muted">
              At least 8 characters, including a letter and a number.
            </p>
          </div>

          <div>
            <Label>I am a</Label>
            <Select name="role" value={formData.role} onChange={handleChange}>
              <option value="job_seeker">Job Seeker</option>
              <option value="employer">Employer</option>
            </Select>
          </div>

          {formData.role === "employer" ? (
            <div>
              <Label>Company name</Label>
              <Input
                name="company_name"
                required
                value={formData.company_name}
                onChange={handleChange}
              />
            </div>
          ) : null}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account..." : "Register"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-brand hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}