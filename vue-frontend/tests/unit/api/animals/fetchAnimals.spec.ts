import { describe, it, expect, beforeEach, vi } from "vitest";
import { fetchAnimals } from "../../../../src/api/animals/fetchAnimals";
import axios from "axios";
import * as shuffleModule from "../../../../src/utils/shuffleArray";

// Mock shuffleArray to return the same array it received
vi.spyOn(shuffleModule, "shuffleArray").mockImplementation((arr: any) => arr);

vi.mock("axios");
const mockedAxios = axios as unknown as { get: ReturnType<typeof vi.fn> };

describe("fetchAnimals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Optional: Mock Math.random to always return 0 (first page)
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  it("returns the correct number of animals", async () => {
    // Always returns enough animals to cover the requested amount (3)
    mockedAxios.get.mockResolvedValue({
      data: {
        entries: [
          { meta: { name: "Dog" }, fields: { image: { url: "dog.png" } } },
          { meta: { name: "Cat" }, fields: { image: { url: "cat.png" } } },
          { meta: { name: "Bird" }, fields: { image: { url: "bird.png" } } },
          { meta: { name: "Fish" }, fields: { image: { url: "fish.png" } } },
        ],
      },
    });

    const animals = await fetchAnimals(3);
    expect(animals).toHaveLength(3);
    animals.forEach((animal) => {
      expect(animal.name).toBeDefined();
      expect(animal.imageUrl).toBeDefined();
    });
  });

  it("throws an error if more animals than the maximum are requested", async () => {
    await expect(fetchAnimals(100)).rejects.toThrow(/Cannot fetch more than/);
  });

  it("returns an empty array if 0 or a negative number is requested", async () => {
    await expect(fetchAnimals(0)).resolves.toEqual([]);
    await expect(fetchAnimals(-2)).resolves.toEqual([]);
  });

  it("throws an error if the request fails", async () => {
    // All requests fail now
    mockedAxios.get.mockRejectedValue(new Error("fail"));
    await expect(fetchAnimals(2)).rejects.toThrow(
      /Failed to fetch animal cards/
    );
  });
});
