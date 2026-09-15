"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Input, Label, Select, Textarea } from "@/components/ui";
import { EMPLOYMENT_TYPES } from "@/lib/constants";

type Profile = {
  first_name: string;
  last_name: string;
  headline?: string | null;
  education?: string | null;
  work_experience?: string | null;
  experience_years?: number | null;
  location?: string | null;
  employment_type_preference?: string | null;
  availability?: string | null;
  other_qualifications?: string | null;
  skills: string[];
  profile_picture?: string | null;
};

export function SeekerProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(profile.skills || []);
  const [preview, setPreview] = useState<string | null>(profile.profile_picture || null);

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

  async function uploadProfilePic(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/profile/seeker", {
      method: "PATCH",
      body: form, // multipart for image
    });

    const text = await res.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      setError("Could not upload profile picture. Check server/database.");
      return;
    }

    if (!res.ok) {
      setError(data.error || "Could not upload profile picture.");
      return;
    }

    if (data.profile_picture) {
      setPreview(data.profile_picture);
    }

    setSuccess("Profile picture updated.");
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const payload = {
      first_name: form.get("first_name"),
      last_name: form.get("last_name"),
      headline: form.get("headline"),
      education: form.get("education"),
      work_experience: form.get("work_experience"),
      experience_years: form.get("experience_years")
        ? Number(form.get("experience_years"))
        : null,
      location: form.get("location"),
      employment_type_preference: form.get("employment_type_preference"),
      availability: form.get("availability"),
      other_qualifications: form.get("other_qualifications"),
      skills,
    };

    try {
      const res = await fetch("/api/profile/seeker", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        setError("Server returned invalid response. Check database connection.");
        setLoading(false);
        return;
      }

      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Could not save profile.");
        return;
      }

      setSuccess("Profile saved.");
      router.refresh();
    } catch {
      setLoading(false);
      setError("Something went wrong while saving profile.");
    }
  }

  return (
    <div className="space-y-6">
      {/* PROFILE PICTURE */}
      <form onSubmit={uploadProfilePic} className="space-y-3">
        <Label>Profile picture</Label>

        <div className="flex items-center gap-4">
          <div className="h-20 w-20 overflow-hidden rounded-full border bg-slate-100">
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                No photo
              </div>
            )}
          </div>

          <div className="space-y-2">
            <input
              type="file"
              name="profile_picture"
              accept="image/png,image/jpeg,image/webp"
              className="block text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setPreview(URL.createObjectURL(file));
              }}
            />
            <Button type="submit" variant="secondary">
              Upload photo
            </Button>
          </div>
        </div>
      </form>

      {/* PROFILE DETAILS */}
      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        {error ? (
          <div className="md:col-span-2">
            <Alert>{error}</Alert>
          </div>
        ) : null}

        {success ? (
          <div className="md:col-span-2">
            <Alert tone="info">{success}</Alert>
          </div>
        ) : null}

        <div>
          <Label>First name</Label>
          <Input name="first_name" required defaultValue={profile.first_name} />
        </div>

        <div>
          <Label>Last name</Label>
          <Input name="last_name" required defaultValue={profile.last_name} />
        </div>

        <div className="md:col-span-2">
          <Label>Professional headline</Label>
          <Input name="headline" defaultValue={profile.headline || ""} />
        </div>

        <div className="md:col-span-2">
          <Label>Education</Label>
          <Textarea name="education" rows={3} defaultValue={profile.education || ""} />
        </div>

        <div className="md:col-span-2">
          <Label>Work experience</Label>
          <Textarea
            name="work_experience"
            rows={4}
            defaultValue={profile.work_experience || ""}
          />
        </div>

        <div>
          <Label>Years of experience</Label>
          <Input
            type="number"
            min={0}
            name="experience_years"
            defaultValue={profile.experience_years ?? ""}
          />
        </div>

        <div>
          <Label>Location</Label>
          <Input name="location" defaultValue={profile.location || ""} />
        </div>

        <div>
          <Label>Employment type preference</Label>
          <Select
            name="employment_type_preference"
            defaultValue={profile.employment_type_preference || ""}
          >
            <option value="">Any</option>
            {(EMPLOYMENT_TYPES || ["full-time", "part-time", "contract", "internship"]).map(
              (t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              )
            )}
          </Select>
        </div>

        <div>
          <Label>Availability</Label>
          <Input name="availability" defaultValue={profile.availability || ""} />
        </div>

        {/* Skills */}
        <div className="md:col-span-2">
          <Label>Skills</Label>
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

        <div className="md:col-span-2">
          <Label>Other qualifications</Label>
          <Textarea
            name="other_qualifications"
            rows={2}
            defaultValue={profile.other_qualifications || ""}
          />
        </div>

        <div className="md:col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}