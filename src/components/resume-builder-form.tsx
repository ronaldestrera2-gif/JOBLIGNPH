"use client";

import { useMemo, useRef, useState } from "react";
import { Button, Input, Label, Textarea } from "@/components/ui";

type Initial = {
  first_name: string;
  last_name: string;
  headline: string;
  email: string;
  location: string;
  education: string;
  work_experience: string;
  skills: string[];
  certifications: string;
  photo: string;
};

export function ResumeBuilderForm({ initial }: { initial: Initial }) {
  const previewRef = useRef<HTMLDivElement>(null);

  const [firstName, setFirstName] = useState(initial.first_name);
  const [lastName, setLastName] = useState(initial.last_name);
  const [headline, setHeadline] = useState(initial.headline);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState(initial.location);
  const [education, setEducation] = useState(initial.education);
  const [experience, setExperience] = useState(initial.work_experience);
  const [skillsText, setSkillsText] = useState(initial.skills.join(", "));
  const [certifications, setCertifications] = useState(initial.certifications || "");
  const [summary, setSummary] = useState("");
  const [photo, setPhoto] = useState(initial.photo || "");

  const fullName = useMemo(
    () => `${firstName} ${lastName}`.trim() || "Your Name",
    [firstName, lastName]
  );

  function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhoto(url);
  }

  function downloadWord() {
    const html = previewRef.current?.innerHTML || "";
    const content = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
            xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"><title>${fullName} Resume</title></head>
        <body>${html}</body>
      </html>
    `;

    const blob = new Blob(["\ufeff", content], {
      type: "application/msword",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fullName.replace(/\s+/g, "_") || "resume"}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadPdf() {
    // Opens print dialog chooses "Save as PDF"
    const html = previewRef.current?.innerHTML || "";
    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>${fullName} Resume</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111; padding: 24px; }
            img { object-fit: cover; }
            h1 { margin: 0 0 4px; font-size: 28px; }
            h2 { margin: 18px 0 8px; font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
            p, li { font-size: 13px; line-height: 1.5; white-space: pre-wrap; }
            .muted { color: #555; }
            .header { display: flex; gap: 16px; align-items: center; margin-bottom: 16px; }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* FORM */}
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>First name</Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <Label>Last name</Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>

        <div>
          <Label>Headline</Label>
          <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>

        <div>
          <Label>Location</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>

        <div>
          <Label>Profile picture</Label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="mt-1 block w-full text-sm"
            onChange={onPhotoChange}
          />
        </div>

        <div>
          <Label>Professional summary</Label>
          <Textarea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>

        <div>
          <Label>Education</Label>
          <Textarea rows={3} value={education} onChange={(e) => setEducation(e.target.value)} />
        </div>

        <div>
          <Label>Work experience</Label>
          <Textarea rows={5} value={experience} onChange={(e) => setExperience(e.target.value)} />
        </div>

        <div>
          <Label>Skills (comma-separated for this builder only)</Label>
          <Input value={skillsText} onChange={(e) => setSkillsText(e.target.value)} />
        </div>

        <div>
          <Label>Certifications</Label>
          <Textarea rows={3} value={certifications} onChange={(e) => setCertifications(e.target.value)} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={downloadPdf}>
            Download PDF
          </Button>
          <Button type="button" variant="secondary" onClick={downloadWord}>
            Download Word
          </Button>
        </div>
      </div>

      {/* PREVIEW */}
      <div className="rounded-xl border border-line bg-white p-5">
        <p className="mb-3 text-sm font-medium text-muted">Live Preview</p>

        <div ref={previewRef}>
          <div className="header" style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {photo ? (
              <img
                src={photo}
                alt="Profile"
                width={84}
                height={84}
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid #ddd",
                }}
              />
            ) : null}

            <div>
              <h1 style={{ margin: 0 }}>{fullName}</h1>
              <p className="muted" style={{ margin: "4px 0" }}>
                {headline || "Professional Headline"}
              </p>
              <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                {[email, phone, location].filter(Boolean).join(" • ")}
              </p>
            </div>
          </div>

          {summary ? (
            <>
              <h2>Summary</h2>
              <p>{summary}</p>
            </>
          ) : null}

          <h2>Education</h2>
          <p>{education || "No education provided."}</p>

          <h2>Work Experience</h2>
          <p>{experience || "No work experience provided."}</p>

          <h2>Skills</h2>
          <p>{skillsText || "No skills listed."}</p>

          <h2>Certifications</h2>
          <p>{certifications || "No certifications listed."}</p>
        </div>
      </div>
    </div>
  );
}