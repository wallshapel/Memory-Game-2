// tests/unit/utils/shuffleArray.spec.ts
import { describe, it, expect } from "vitest";
import { shuffleArray } from "../../../src/utils/shuffleArray";

describe("shuffleArray", () => {
  it("should return an array with the same elements, though the order may change", () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray([...arr]);
    // Same elements, possible different order
    expect(shuffled.sort()).toEqual(arr.sort());
  });

  it("should not modify the original array", () => {
    const arr = [10, 20, 30];
    const copy = [...arr];
    shuffleArray(arr);
    expect(arr).toEqual(copy);
  });

  it("should work with an empty array", () => {
    expect(shuffleArray([])).toEqual([]);
  });

  it("should work with a single element", () => {
    expect(shuffleArray([99])).toEqual([99]);
  });
});
