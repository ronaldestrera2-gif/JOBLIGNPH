"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Input, Label, Select, Textarea } from "@/components/ui";
import { EMPLOYMENT_TYPES } from "@/lib/constants";

export function JobForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  function addSkill() {
    const value = skillInput.trim();
    if (!value) return;

    const exists = skills.some((s) => s.toLowerCase() === value.toLowerCase());
    if (exists) {
      setSkillInput("");
      return;
    }

    setSkills((prev) => [...prev, value]);
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const form = new FormData(e.currentTarget);
      const status = String(form.get("status") || "active");

      if (status !== "active" && status !== "draft") {
        setError("Status must be Active or Draft only.");
        setLoading(false);
        return;
      }

      const payload = {
        job_title: String(form.get("job_title") || "").trim(),
        job_description: String(form.get("job_description") || "").trim(),
        location: String(form.get("location") || "").trim(),
        employment_type: String(form.get("employment_type") || "full-time"),
        salary_min: form.get("salary_min")
          ? Number(form.get("salary_min"))
          : null,
        salary_max: null,
        salary_period: String(form.get("salary_period") || "monthly"),
        deadline: String(form.get("deadline") || "") || null,
        status,
        skills,
      };

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        setError("Server returned an invalid response. Check terminal logs.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Could not create job.");
        setLoading(false);
        return;
      }

      router.push("/employer/jobs");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Something went wrong while creating the job.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? <Alert>{error}</Alert> : null}

      <div>
        <Label>Job title</Label>
        <Input name="job_title" required />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          name="job_description"
          rows={8}
          required
          placeholder="Write the full job description..."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Location</Label>
          <Input name="location" required />
        </div>

        <div>
          <Label>Employment type</Label>
          <Select name="employment_type" defaultValue="full-time">
            {(EMPLOYMENT_TYPES || [
              "full-time",
              "part-time",
              "contract",
              "internship",
            ]).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Salary (PHP)</Label>
          <Input
            type="number"
            min={0}
            name="salary_min"
            placeholder="e.g. 15000"
          />
        </div>

        <div>
          <Label>Salary period</Label>
          <Select name="salary_period" defaultValue="monthly">
            <option value="monthly">Per Month</option>
            <option value="weekly">Per Week</option>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Application deadline</Label>
          <Input type="date" name="deadline" />
        </div>

        <div>
          <Label>Status</Label>
          <Select name="status" defaultValue="active">
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </Select>
        </div>
      </div>

      <div>
        <Label>Required skills</Label>
        <div className="mt-1 flex gap-2">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Type a skill"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
          />
          <Button type="button" variant="secondary" onClick={addSkill}>
            Add Skill
          </Button>
        </div>

        {skills.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-red-600 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">No skills added yet.</p>
        )}
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create job"}
      </Button>
    </form>
  );
}