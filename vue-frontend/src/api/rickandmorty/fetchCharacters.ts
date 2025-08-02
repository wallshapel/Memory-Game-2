// src/api/rickandmorty/fetchCharacters.ts
import axios from "axios";
import type { IThemeData } from "../../interfaces/IThemeData";
import { shuffleArray } from "../../utils/shuffleArray";

const API_URL = "https://rickandmortyapi.com/api/character";
const PAGE_SIZE = 20;
const TOTAL_CHARACTERS = 826;
const TOTAL_PAGES = 42;

/**
 * Fetches a random selection of Rick and Morty characters.
 * @param needed Number of characters to fetch.
 * @returns Promise resolving to array of IThemeData.
 * @throws Error if requested amount exceeds available characters or is invalid.
 */
export async function fetchCharacters(needed: number): Promise<IThemeData[]> {
  if (needed <= 0) return [];

  if (needed > TOTAL_CHARACTERS)
    throw new Error(`Cannot fetch more than ${TOTAL_CHARACTERS} characters`);

  const maxPagesNeeded = Math.ceil(needed / PAGE_SIZE);
  const selectedPages = new Set<number>();

  while (selectedPages.size < maxPagesNeeded)
    selectedPages.add(Math.floor(Math.random() * TOTAL_PAGES) + 1);

  // Fetch all pages in parallel, catching errors to prevent whole failure
  const responses = await Promise.all(
    Array.from(selectedPages).map(async (page) => {
      try {
        return await axios.get(API_URL, { params: { page } });
      } catch (error) {
        console.error(`Failed to fetch page ${page}:`, error);
        return null;
      }
    })
  );

  // Filter out any failed requests
  const validResponses = responses.filter(
    (res) => res && res.data && res.data.results
  );

  // Extract character data
  const allCharacters: IThemeData[] = validResponses.flatMap((res) =>
    res!.data.results.map((char: any) => ({
      id: String(char.id),
      name: char.name,
      imageUrl: char.image,
    }))
  );

  // Filter out characters missing name or image
  const validCharacters = allCharacters.filter((c) => c.name && c.imageUrl);

  // Remove duplicates by name
  const uniqueCharacters = Array.from(
    new Map(validCharacters.map((c) => [c.name, c])).values()
  );

  // Shuffle and limit to needed amount
  const shuffled = shuffleArray(uniqueCharacters);

  return shuffled.slice(0, needed);
}
