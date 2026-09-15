type MatchInput = {
  jobTitle: string;
  requiredSkills: string[];
  candidateSkills: string[];
  matchScore: number;
};

export async function getAIMatchInsight(input: MatchInput): Promise<string> {
  const required = (input.requiredSkills || []).map((s) => s.trim()).filter(Boolean);
  const candidate = (input.candidateSkills || []).map((s) => s.trim()).filter(Boolean);

  const requiredLower = required.map((s) => s.toLowerCase());
  const candidateLower = candidate.map((s) => s.toLowerCase());

  const matching = required.filter((s) =>
    candidateLower.includes(s.toLowerCase())
  );
  const missing = required.filter(
    (s) => !candidateLower.includes(s.toLowerCase())
  );

  // No OpenAI call — local insight only
  if (input.matchScore >= 80) {
    return `Strong match for ${input.jobTitle}. Matching skills: ${
      matching.join(", ") || "none listed"
    }. ${
      missing.length
        ? `You may still improve by adding: ${missing.join(", ")}.`
        : "Your skills cover the main requirements."
    }`;
  }

  if (input.matchScore >= 50) {
    return `Moderate match for ${input.jobTitle}. You already have: ${
      matching.join(", ") || "limited overlap"
    }. Consider improving: ${missing.join(", ") || "additional related skills"}.`;
  }

  return `Low match for ${input.jobTitle}. Missing key skills: ${
    missing.join(", ") || "not specified"
  }. Update your profile skills to improve recommendations.`;
}