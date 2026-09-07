"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Input, Label, Select, Textarea } from "@/components/ui";
import { EMPLOYMENT_TYPES, JOB_STATUSES, SKILL_LEVELS } from "@/lib/constants";

type SkillRow = { skill_name: string; required_level: string };

export function JobForm({
  jobId,
  initial,
}: {
  jobId?: number;
  initial?: {
    job_title: string;
    job_description: string;
    location: string;
    employment_type: string;
    salary_min?: number | null;
    salary_max?: number | null;
    deadline?: string;
    status: string;
    skills: SkillRow[];
  };
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [skills, setSkills] = useState<SkillRow[]>(
    initial?.skills?.length ? initial.skills : [{ skill_name: "", required_level: "intermediate" }],
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      job_title: form.get("job_title"),
      job_description: form.get("job_description"),
      location: form.get("location"),
      employment_type: form.get("employment_type"),
      salary_min: form.get("salary_min") ? Number(form.get("salary_min")) : undefined,
      salary_max: form.get("salary_max") ? Number(form.get("salary_max")) : undefined,
      deadline: form.get("deadline"),
      status: form.get("status"),
      skills: skills.filter((s) => s.skill_name.trim()),
    };
    const res = await fetch(jobId ? `/api/jobs/${jobId}` : "/api/jobs", {
      method: jobId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not save job.");
      return;
    }
    router.push("/employer/jobs");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {error ? <Alert>{error}</Alert> : null}
      <div><Label>Job title</Label><Input name="job_title" required defaultValue={initial?.job_title} /></div>
      <div><Label>Description</Label><Textarea name="job_description" rows={6} required defaultValue={initial?.job_description} /></div>
      <div className="grid gap-4 md:grid-cols-2">
        <div><Label>Location</Label><Input name="location" required defaultValue={initial?.location} /></div>
        <div>
          <Label>Employment type</Label>
          <Select name="employment_type" defaultValue={initial?.employment_type || "full-time"}>
            {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </div>
        <div><Label>Salary min (PHP)</Label><Input type="number" name="salary_min" defaultValue={initial?.salary_min ?? ""} /></div>
        <div><Label>Salary max (PHP)</Label><Input type="number" name="salary_max" defaultValue={initial?.salary_max ?? ""} /></div>
        <div><Label>Deadline</Label><Input type="date" name="deadline" required defaultValue={initial?.deadline} /></div>
        <div>
          <Label>Status</Label>
          <Select name="status" defaultValue={initial?.status || "draft"}>
            {JOB_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
      </div>
      <div>
        <Label>Required skills</Label>
        <div className="space-y-2">
          {skills.map((row, index) => (
            <div key={index} className="grid grid-cols-[1fr_10rem_auto] gap-2">
              <Input
                value={row.skill_name}
                placeholder="Skill name"
                onChange={(e) => {
                  const next = [...skills];
                  next[index] = { ...row, skill_name: e.target.value };
                  setSkills(next);
                }}
              />
              <Select
                value={row.required_level}
                onChange={(e) => {
                  const next = [...skills];
                  next[index] = { ...row, required_level: e.target.value };
                  setSkills(next);
                }}
              >
                {SKILL_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </Select>
              <Button type="button" variant="ghost" onClick={() => setSkills(skills.filter((_, i) => i !== index))}>
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="secondary" className="mt-2" onClick={() => setSkills([...skills, { skill_name: "", required_level: "intermediate" }])}>
          Add skill
        </Button>
      </div>
      <Button type="submit">{jobId ? "Save job" : "Create job"}</Button>
    </form>
  );
}
