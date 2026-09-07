export type SkillMatchInput = {
  requiredSkills: string[];
  candidateSkills: string[];
};

export type SkillMatchResult = {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
};

export interface MatchingStrategy {
  compute(input: SkillMatchInput): SkillMatchResult;
}

function normalize(name: string) {
  return name.trim().toLowerCase();
}

/**
 * Transparent overlap matcher:
 * score = (matching required skills / total required skills) * 100
 * Architecture is strategy-based so a later model can replace this.
 */
export class SkillOverlapStrategy implements MatchingStrategy {
  compute({ requiredSkills, candidateSkills }: SkillMatchInput): SkillMatchResult {
    const requiredUnique = [
      ...new Map(
        requiredSkills
          .filter((s) => s.trim())
          .map((s) => [normalize(s), s.trim()]),
      ).values(),
    ];
    const candidateSet = new Set(candidateSkills.map(normalize));

    if (requiredUnique.length === 0) {
      return { matchScore: 0, matchingSkills: [], missingSkills: [] };
    }

    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const skill of requiredUnique) {
      if (candidateSet.has(normalize(skill))) {
        matchingSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    }

    const matchScore = Math.round(
      (matchingSkills.length / requiredUnique.length) * 100,
    );

    return { matchScore, matchingSkills, missingSkills };
  }
}

const defaultStrategy: MatchingStrategy = new SkillOverlapStrategy();

export function calculateMatchScore(
  input: SkillMatchInput,
  strategy: MatchingStrategy = defaultStrategy,
): SkillMatchResult {
  const result = strategy.compute(input);
  return {
    ...result,
    matchScore: Math.min(100, Math.max(0, result.matchScore)),
  };
}
