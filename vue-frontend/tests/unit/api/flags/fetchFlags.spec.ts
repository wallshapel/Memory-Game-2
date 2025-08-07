// tests/unit/api/flags/fetchFlags.spec.ts
import { fetchFlags } from "../../../../src/api/flags/fetchFlags";
import { COUNTRY_CODES } from "../../../../src/utils/countryCodes";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("fetchFlags", () => {
  it("returns the correct number of flags", () => {
    const flags = fetchFlags(5);
    expect(flags).toHaveLength(5);
    flags.forEach((flag) => {
      expect(COUNTRY_CODES).toContain(flag.id);
      expect(flag.name).toBe(flag.id);
      expect(flag.imageUrl).toMatch(
        /^https:\/\/flagsapi\.com\/[A-Z]{2}\/shiny\/64\.png$/
      );
    });
  });

  it("throws an error if more flags than available are requested", () => {
    expect(() => fetchFlags(COUNTRY_CODES.length + 1)).toThrow(
      /Cannot fetch more than/
    );
  });

  it("returns an empty array if 0 or a negative number is requested", () => {
    expect(fetchFlags(0)).toEqual([]);
    expect(fetchFlags(-3)).toEqual([]);
  });
});
