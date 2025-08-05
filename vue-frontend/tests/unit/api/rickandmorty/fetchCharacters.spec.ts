// tests/unit/api/rickandmorty/fetchCharacters.spec.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { fetchCharacters } from "../../../../src/api/rickandmorty/fetchCharacters";
import axios from "axios";
import * as shuffleModule from "../../../../src/utils/shuffleArray";

vi.mock("axios");
const mockedAxios = axios as unknown as { get: ReturnType<typeof vi.fn> };

vi.spyOn(shuffleModule, "shuffleArray").mockImplementation((arr: any) => arr);

describe("fetchCharacters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the correct number of characters", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        results: [
          { id: 1, name: "Rick", image: "rick.png" },
          { id: 2, name: "Morty", image: "morty.png" },
        ],
      },
    });

    const chars = await fetchCharacters(2);
    expect(chars).toHaveLength(2);
    expect(chars[0].name).toBe("Rick");
    expect(chars[0].imageUrl).toBe("rick.png");
    expect(chars[1].name).toBe("Morty");
    expect(chars[1].imageUrl).toBe("morty.png");
  });

  it("throws an error if more characters than the maximum are requested", async () => {
    await expect(fetchCharacters(900)).rejects.toThrow(
      /Cannot fetch more than/
    );
  });

  it("returns an empty array if 0 or a negative number is requested", async () => {
    await expect(fetchCharacters(0)).resolves.toEqual([]);
    await expect(fetchCharacters(-2)).resolves.toEqual([]);
  });
});
