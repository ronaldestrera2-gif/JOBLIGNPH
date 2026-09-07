import { describe, expect, it } from "vitest";
import { loginSchema, passwordSchema, registerSchema } from "./validations";

describe("auth validation", () => {
  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "x" });
    expect(result.success).toBe(false);
  });

  it("requires a stronger password on registration", () => {
    expect(passwordSchema.safeParse("short").success).toBe(false);
    expect(passwordSchema.safeParse("password").success).toBe(false);
    expect(passwordSchema.safeParse("Seeker123!").success).toBe(true);
  });

  it("accepts a complete seeker registration payload", () => {
    const result = registerSchema.safeParse({
      first_name: "Miguel",
      last_name: "Santos",
      email: "seeker@joblign.ph",
      password: "Seeker123!",
      role: "job_seeker",
    });
    expect(result.success).toBe(true);
  });
});
