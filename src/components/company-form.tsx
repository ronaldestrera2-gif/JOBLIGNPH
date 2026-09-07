"use client";

import { useRouter } from "next/navigation";
import { Alert, Button, Input, Label, Textarea } from "@/components/ui";
import { useState } from "react";

export function CompanyForm({
  profile,
}: {
  profile: {
    company_name: string;
    company_description?: string | null;
    company_location?: string | null;
    industry?: string | null;
    contact_number?: string | null;
    website?: string | null;
    company_size?: string | null;
    verification_status: string;
    logo_path?: string | null;
  };
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [preview, setPreview] = useState<string | null>(profile.logo_path || null);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setOk("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/profile/employer", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not save company profile.");
      return;
    }

    setOk("Company profile saved.");
    router.refresh();
  }

  async function uploadLogo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setOk("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/profile/employer", {
      method: "PATCH",
      body: form,
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not upload logo.");
      return;
    }

    if (data.logo_path) {
      setPreview(data.logo_path);
    }

    setOk("Logo uploaded successfully!");
    router.refresh();
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Verification status: <strong>{profile.verification_status}</strong>
      </p>

      {error ? <Alert>{error}</Alert> : null}
      {ok ? <Alert tone="info">{ok}</Alert> : null}

      {/* Logo Section - Clearer UI */}
      <div className="flex items-center gap-6 p-4 border rounded-lg bg-gray-50">
        <div className="h-20 w-20 rounded-lg overflow-hidden bg-white border flex items-center justify-center shrink-0">
          {preview ? (
            <img
              src={preview}
              alt="Company Logo"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-sm">No Logo</span>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <Label className="font-medium">Company Logo</Label>

          <form onSubmit={uploadLogo} className="flex flex-col gap-3">
            <label className="cursor-pointer w-fit">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Select Image
              </div>
              <input
                type="file"
                name="logo"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoChange}
                className="hidden"
              />
            </label>

            <Button type="submit" variant="secondary" className="w-fit">
              Upload Logo
            </Button>
          </form>

          <p className="text-xs text-gray-500">
            1. Click <strong>Select Image</strong> → choose a photo<br />
            2. Then click <strong>Upload Logo</strong>
          </p>
        </div>
      </div>

      {/* Company Info Form */}
      <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>Company name</Label>
          <Input name="company_name" required defaultValue={profile.company_name} />
        </div>

        <div className="md:col-span-2">
          <Label>Description</Label>
          <Textarea
            name="company_description"
            rows={4}
            defaultValue={profile.company_description || ""}
          />
        </div>

        <div>
          <Label>Location</Label>
          <Input name="company_location" defaultValue={profile.company_location || ""} />
        </div>

        <div>
          <Label>Industry</Label>
          <Input name="industry" defaultValue={profile.industry || ""} />
        </div>

        <div>
          <Label>Contact number</Label>
          <Input name="contact_number" defaultValue={profile.contact_number || ""} />
        </div>

        <div>
          <Label>Website</Label>
          <Input
            name="website"
            defaultValue={profile.website || ""}
            placeholder="https://"
          />
        </div>

        <div>
          <Label>Company size</Label>
          <Input
            name="company_size"
            defaultValue={profile.company_size || ""}
            placeholder="11-50"
          />
        </div>

        <div className="md:col-span-2">
          <Button type="submit">Save company profile</Button>
        </div>
      </form>
    </div>
  );
}