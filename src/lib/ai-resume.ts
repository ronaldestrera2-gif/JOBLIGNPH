import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateResumeDraft(input: {
  fullName: string;
  headline?: string | null;
  education?: string | null;
  workExperience?: string | null;
  skills?: string[];
  certifications?: string | null;
  location?: string | null;
}) {
  if (!process.env.OPENAI_API_KEY) {
    return "AI Resume Builder is currently unavailable. Missing API key.";
  }

  const prompt = `
Create a clean professional resume draft for a Filipino job seeker.

Name: ${input.fullName}
Headline: ${input.headline || "N/A"}
Location: ${input.location || "N/A"}
Education: ${input.education || "N/A"}
Work Experience: ${input.workExperience || "N/A"}
Skills: ${input.skills?.join(", ") || "N/A"}
Certifications: ${input.certifications || "N/A"}

Format the resume with these sections:
1. Professional Summary
2. Skills
3. Work Experience
4. Education
5. Certifications

Keep it concise, formal, and ready to copy.
`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 800,
    });

    return response.choices[0]?.message?.content || "Could not generate resume.";
  } catch (error) {
    console.error("AI resume error:", error);
    return "AI Resume Builder is temporarily unavailable.";
  }
}