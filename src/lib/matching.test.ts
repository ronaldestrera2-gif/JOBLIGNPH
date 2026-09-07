import { describe, expect, it } from "vitest";
import { calculateMatchScore, SkillOverlapStrategy } from "../src/lib/matching";

describe("skill matching", () => {
  it("scores the documented JavaScript/React example at 75", () => {
    const result = calculateMatchScore({
      candidateSkills: ["JavaScript", "HTML", "CSS", "React"],
      requiredSkills: ["JavaScript", "React", "HTML", "SQL"],
    });
    expect(result.matchScore).toBe(75);
    expect(result.matchingSkills).toEqual(["JavaScript", "React", "HTML"]);
    expect(result.missingSkills).toEqual(["SQL"]);
  });

  it("scores the documented Java/SQL example at 80", () => {
    const result = calculateMatchScore({
      candidateSkills: ["Java", "SQL", "Git", "HTML"],
      requiredSkills: ["Java", "SQL", "Git", "HTML", "CSS"],
    });
    expect(result.matchScore).toBe(80);
    expect(result.missingSkills).toEqual(["CSS"]);
  });

  it("is case-insensitive and ignores duplicate required skills", () => {
    const result = calculateMatchScore({
      candidateSkills: ["javascript", "react"],
      requiredSkills: ["JavaScript", "JAVASCRIPT", "SQL"],
    });
    expect(result.matchScore).toBe(50);
  });

  it("returns 0 when a job lists no required skills", () => {
    expect(
      calculateMatchScore({ candidateSkills: ["Java"], requiredSkills: [] }).matchScore,
    ).toBe(0);
  });

  it("can be replaced with another strategy", () => {
    const always = {
      compute: () => ({ matchScore: 42, matchingSkills: [], missingSkills: [] }),
    };
    expect(
      calculateMatchScore({ candidateSkills: [], requiredSkills: ["A"] }, always).matchScore,
    ).toBe(42);
    expect(new SkillOverlapStrategy().compute({ candidateSkills: ["A"], requiredSkills: ["A"] }).matchScore).toBe(100);
  });
});
