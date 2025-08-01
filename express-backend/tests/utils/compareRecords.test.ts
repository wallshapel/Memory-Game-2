// tests/utils/compareRecords.test.ts
import { describe, it, expect } from "vitest";
import { compareRecords } from "../../src/utils/compareRecords";

describe("compareRecords", () => {
  it("should sort by difficulty DESC", () => {
    const a = { difficulty: 2, totalCards: 20, effectiveness: 50, time: 100 };
    const b = { difficulty: 3, totalCards: 20, effectiveness: 50, time: 100 };
    // b is harder, should be before a
    expect(compareRecords(a, b)).toBe(1);
    expect(compareRecords(b, a)).toBe(-1);
  });

  it("should sort by totalCards DESC if difficulty is equal", () => {
    const a = { difficulty: 3, totalCards: 16, effectiveness: 50, time: 100 };
    const b = { difficulty: 3, totalCards: 20, effectiveness: 50, time: 100 };
    // b has more cards, should be before a
    expect(compareRecords(a, b)).toBe(4);
    expect(compareRecords(b, a)).toBe(-4);
  });

  it("should sort by effectiveness DESC if diff and cards are equal", () => {
    const a = { difficulty: 2, totalCards: 16, effectiveness: 75, time: 100 };
    const b = { difficulty: 2, totalCards: 16, effectiveness: 90, time: 100 };
    expect(compareRecords(a, b)).toBe(15);
    expect(compareRecords(b, a)).toBe(-15);
  });

  it("should sort by time ASC if others are equal", () => {
    const a = { difficulty: 3, totalCards: 16, effectiveness: 50, time: 120 };
    const b = { difficulty: 3, totalCards: 16, effectiveness: 50, time: 100 };
    // b is faster (smaller time), so b comes first
    expect(compareRecords(a, b)).toBe(20); // 120 - 100 = 20
    expect(compareRecords(b, a)).toBe(-20); // 100 - 120 = -20
  });

  it("should return 0 if all fields are equal", () => {
    const a = { difficulty: 3, totalCards: 16, effectiveness: 90, time: 100 };
    const b = { difficulty: 3, totalCards: 16, effectiveness: 90, time: 100 };
    expect(compareRecords(a, b)).toBe(0);
  });
});
