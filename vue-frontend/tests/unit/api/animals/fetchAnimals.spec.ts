import { describe, it, expect, beforeEach, vi } from "vitest";
import { fetchAnimals } from "../../../../src/api/animals/fetchAnimals";
import axios from "axios";
import * as shuffleModule from "../../../../src/utils/shuffleArray";

// Mock de shuffleArray para que devuelva igual el array recibido
vi.spyOn(shuffleModule, "shuffleArray").mockImplementation((arr: any) => arr);

vi.mock("axios");
const mockedAxios = axios as unknown as { get: ReturnType<typeof vi.fn> };

describe("fetchAnimals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Opcional: Mockea Math.random para que siempre devuelva 0 (primera página)
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  it("devuelve el número correcto de animales", async () => {
    // Siempre devuelve suficientes animales para cubrir lo pedido (3)
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

  it("lanza error si se piden más animales que el máximo", async () => {
    await expect(fetchAnimals(100)).rejects.toThrow(/Cannot fetch more than/);
  });

  it("devuelve array vacío si se pide 0 o negativo", async () => {
    await expect(fetchAnimals(0)).resolves.toEqual([]);
    await expect(fetchAnimals(-2)).resolves.toEqual([]);
  });

  it("lanza error si la petición falla", async () => {
    // Ahora TODAS las llamadas fallan
    mockedAxios.get.mockRejectedValue(new Error("fail"));
    await expect(fetchAnimals(2)).rejects.toThrow(
      /Failed to fetch animal cards/
    );
  });
});
