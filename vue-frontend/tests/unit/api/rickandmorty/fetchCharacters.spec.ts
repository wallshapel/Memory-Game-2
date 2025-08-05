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

  it("devuelve el número correcto de personajes", async () => {
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

  it("lanza error si se piden más personajes que el máximo", async () => {
    await expect(fetchCharacters(900)).rejects.toThrow(
      /Cannot fetch more than/
    );
  });

  it("devuelve array vacío si se pide 0 o negativo", async () => {
    await expect(fetchCharacters(0)).resolves.toEqual([]);
    await expect(fetchCharacters(-2)).resolves.toEqual([]);
  });
});
