import axios from "axios";
import type { ThemeData } from "../../types/ThemeData";
import { shuffleArray } from "../../utils/shuffleArray";

const API_URL = "https://rickandmortyapi.com/api/character";

export async function fetchCharacters(needed: number): Promise<ThemeData[]> {
  const PAGE_SIZE = 20;
  const TOTAL_CHARACTERS = 826;
  const TOTAL_PAGES = 42;

  if (needed > TOTAL_CHARACTERS)
    throw new Error(`Cannot fetch more than ${TOTAL_CHARACTERS} characters`);

  const maxPagesNeeded = Math.ceil(needed / PAGE_SIZE);
  const selectedPages = new Set<number>();
  while (selectedPages.size < maxPagesNeeded)
    selectedPages.add(Math.floor(Math.random() * TOTAL_PAGES) + 1);

  const responses = await Promise.all(
    Array.from(selectedPages).map((page) =>
      axios.get(API_URL, {
        params: { page },
      })
    )
  );

  const allCharacters: ThemeData[] = responses.flatMap((res) =>
    res.data.results.map((char: any) => ({
      id: String(char.id),
      name: char.name,
      imageUrl: char.image,
    }))
  );
  // We validate that no characters without names and/or images come to us
  const validCharacters = allCharacters.filter((c) => c.name && c.imageUrl);
  const uniqueCharacters = Array.from(
    new Map(validCharacters.map((c) => [c.name, c])).values()
  );
  const shuffled = shuffleArray(uniqueCharacters);

  return shuffled.slice(0, needed);
}
