"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Input, Label, Select, Textarea } from "@/components/ui";
import { EMPLOYMENT_TYPES } from "@/lib/constants";

type InitialJob = {
  job_title: string;
  job_description: string;
  location: string;
  employment_type: string;
  salary_min: number | null;
  salary_max: number | null;
  deadline: string;
  status: string;
  skills: { skill_name?: string; name?: string }[] | string[];
};

function normalizeSkills(
  skills: InitialJob["skills"] | undefined
): string[] {
  if (!skills) return [];
  return skills
    .map((s) => {
      if (typeof s === "string") return s.trim();
      return String(s.skill_name || s.name || "").trim();
    })
    .filter(Boolean);
}

export function JobForm({
  jobId,
  initial,
}: {
  jobId?: number;
  initial?: InitialJob;
} = {}) {
  const router = useRouter();
  const isEdit = Boolean(jobId);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const startingSkills = useMemo(
    () => normalizeSkills(initial?.skills),
    [initial?.skills]
  );

  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(startingSkills);

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

      if (status !== "active" && status !== "draft" && status !== "closed") {
        setError("Invalid status.");
        setLoading(false);
        return;
      }

      // When creating, only draft/active
      if (!isEdit && status === "closed") {
        setError("Status must be Active or Draft only when creating.");
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

      const res = await fetch(isEdit ? `/api/jobs/${jobId}` : "/api/jobs", {
        method: isEdit ? "PATCH" : "POST",
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
        setError(data.error || `Could not ${isEdit ? "update" : "create"} job.`);
        setLoading(false);
        return;
      }

      router.push("/employer/jobs");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Something went wrong while saving the job.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? <Alert>{error}</Alert> : null}

      <div>
        <Label>Job title</Label>
        <Input
          name="job_title"
          required
          defaultValue={initial?.job_title || ""}
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          name="job_description"
          rows={8}
          required
          defaultValue={initial?.job_description || ""}
          placeholder="Write the full job description..."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Location</Label>
          <Input
            name="location"
            required
            defaultValue={initial?.location || ""}
          />
        </div>

        <div>
          <Label>Employment type</Label>
          <Select
            name="employment_type"
            defaultValue={initial?.employment_type || "full-time"}
          >
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
            defaultValue={initial?.salary_min ?? ""}
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
          <Input
            type="date"
            name="deadline"
            defaultValue={
              initial?.deadline
                ? initial.deadline.slice(0, 10)
                : ""
            }
          />
        </div>

        <div>
          <Label>Status</Label>
          <Select
            name="status"
            defaultValue={initial?.status || "active"}
          >
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            {isEdit ? <option value="closed">Closed</option> : null}
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
        {loading
          ? isEdit
            ? "Saving..."
            : "Creating..."
          : isEdit
            ? "Save job"
            : "Create job"}
      </Button>
    </form>
  );
}