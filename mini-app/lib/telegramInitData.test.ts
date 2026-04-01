import { describe, expect, it } from "vitest";
import { validateTelegramInitData } from "./telegramInitData";

describe("validateTelegramInitData", () => {
  it("rejects empty input", () => {
    expect(validateTelegramInitData("", "token").ok).toBe(false);
    expect(validateTelegramInitData("x=1", "").ok).toBe(false);
  });

  it("rejects missing hash", () => {
    const r = validateTelegramInitData("auth_date=1&user=%7B%22id%22%3A1%7D", "bot");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("no_hash");
  });
});
