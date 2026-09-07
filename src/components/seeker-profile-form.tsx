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
  certifications?: string | null;
  other_qualifications?: string | null;
  skills: string[];
  profile_picture?: string | null; // ← Added
};

export function SeekerProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [skills, setSkills] = useState(profile.skills.join(", "));
  const [preview, setPreview] = useState<string | null>(profile.profile_picture || null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const form = new FormData(e.currentTarget);

    // Convert skills
    form.set(
      "skills",
      skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .join(",")
    );

    const res = await fetch("/api/profile/seeker", {
      method: "PATCH",
      body: form, // Using FormData so we can upload file
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Could not save profile.");
      return;
    }

    setSuccess("Profile saved successfully!");
    router.refresh();
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2" encType="multipart/form-data">
      {error && (
        <div className="md:col-span-2">
          <Alert>{error}</Alert>
        </div>
      )}
      {success && (
        <div className="md:col-span-2">
          <Alert tone="info">{success}</Alert>
        </div>
      )}

      {/* Profile Picture */}
      <div className="md:col-span-2 flex items-center gap-6">
        <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 border">
          {preview ? (
            <img src={preview} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
              No Photo
            </div>
          )}
        </div>

        <div>
          <Label>Profile Picture</Label>
          <Input
            type="file"
            name="profile_picture"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">Recommended: Square image (JPG/PNG)</p>
        </div>
      </div>

      <div>
        <Label>First name</Label>
        <Input name="first_name" defaultValue={profile.first_name} required />
      </div>

      <div>
        <Label>Last name</Label>
        <Input name="last_name" defaultValue={profile.last_name} required />
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
        <Textarea name="work_experience" rows={4} defaultValue={profile.work_experience || ""} />
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
        <Select name="employment_type_preference" defaultValue={profile.employment_type_preference || ""}>
          <option value="">Any</option>
          {EMPLOYMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Availability</Label>
        <Input name="availability" defaultValue={profile.availability || ""} />
      </div>

      <div className="md:col-span-2">
        <Label>Skills (comma-separated)</Label>
        <Input value={skills} onChange={(e) => setSkills(e.target.value)} />
      </div>

      <div className="md:col-span-2">
        <Label>Certifications</Label>
        <Textarea name="certifications" rows={2} defaultValue={profile.certifications || ""} />
      </div>

      <div className="md:col-span-2">
        <Label>Other qualifications</Label>
        <Textarea name="other_qualifications" rows={2} defaultValue={profile.other_qualifications || ""} />
      </div>

      <div className="md:col-span-2">
        <Button type="submit">Save profile</Button>
      </div>
    </form>
  );
}