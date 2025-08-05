// tests/unit/api/flags/fetchFlags.spec.ts
import { fetchFlags } from "../../../../src/api/flags/fetchFlags";
import { COUNTRY_CODES } from "../../../../src/utils/countryCodes";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("fetchFlags", () => {
  it("returns the correct number of flags", async () => {
    const flags = await fetchFlags(5);
    expect(flags).toHaveLength(5);
    flags.forEach((flag) => {
      expect(COUNTRY_CODES).toContain(flag.id);
      expect(flag.name).toBe(flag.id);
      expect(flag.imageUrl).toMatch(
        /^https:\/\/flagsapi\.com\/[A-Z]{2}\/shiny\/64\.png$/
      );
    });
  });

  it("throws an error if more flags than available are requested", async () => {
    await expect(fetchFlags(COUNTRY_CODES.length + 1)).rejects.toThrow(
      /Cannot fetch more than/
    );
  });

  it("returns an empty array if 0 or a negative number is requested", async () => {
    await expect(fetchFlags(0)).resolves.toEqual([]);
    await expect(fetchFlags(-3)).resolves.toEqual([]);
  });
});
