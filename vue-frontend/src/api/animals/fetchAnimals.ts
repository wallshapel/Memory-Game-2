// src/api/animals/fetchAnimals.ts
import axios from "axios";
import type { IThemeData } from "../../interfaces/IThemeData";
import { shuffleArray } from "../../utils/shuffleArray";

const API_URL =
  "https://fed-team.modyo.cloud/api/content/spaces/animals/types/game/entries";
const TOTAL_CARDS_AVAILABLE = 20;
const PAGE_SIZE = 5;

/**
 * Fetches a specified number of animal cards from paginated API,
 * ensuring uniqueness, shuffling, and valid data.
 *
 * @param needed - Number of cards required (max 20)
 * @returns Promise resolving to array of IThemeData
 * @throws Error if requested number exceeds available cards or invalid
 */
export async function fetchAnimals(needed: number): Promise<IThemeData[]> {
  if (needed <= 0) return [];
  if (needed > TOTAL_CARDS_AVAILABLE)
    throw new Error(
      `Cannot fetch more than ${TOTAL_CARDS_AVAILABLE} distinct cards`
    );

  const numPages = Math.ceil(TOTAL_CARDS_AVAILABLE / PAGE_SIZE);
  const maxUniquePages = Math.min(numPages, Math.ceil(needed / PAGE_SIZE));

  // Randomly select pages to fetch to diversify results
  const selectedPages = new Set<number>();
  while (selectedPages.size < maxUniquePages) {
    selectedPages.add(Math.floor(Math.random() * numPages) + 1);
  }

  try {
    // Concurrently fetch all selected pages
    const responses = await Promise.all(
      Array.from(selectedPages).map((page) =>
        axios.get(API_URL, {
          params: {
            per_page: PAGE_SIZE,
            page,
          },
        })
      )
    );

    // Extract name and image URL from each entry
    const allCards: IThemeData[] = responses.flatMap((res) =>
      res.data.entries.map((entry: any) => ({
        name: entry.meta?.name ?? `Unnamed-${Math.random()}`,
        imageUrl: entry.fields?.image?.url ?? "",
      }))
    );

    // Filter out entries without name or image
    const validCards = allCards.filter((c) => c.name && c.imageUrl);

    // Remove duplicates by name, preserving insertion order
    const uniqueCards = Array.from(
      new Map(validCards.map((c) => [c.name, c])).values()
    );

    // Shuffle the cards to randomize order
    const shuffled = shuffleArray(uniqueCards);

    // Return only the number of cards requested
    return shuffled.slice(0, needed);
  } catch (error) {
    console.error("Error fetching animal cards:", error);
    throw new Error("Failed to fetch animal cards");
  }
}
