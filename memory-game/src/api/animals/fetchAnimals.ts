import axios from "axios";
import type { ThemeData } from "../../types/ThemeData";
import { shuffleArray } from "../../utils/shuffleArray";

const API_URL =
  "https://fed-team.modyo.cloud/api/content/spaces/animals/types/game/entries";
const TOTAL_CARDS_AVAILABLE = 20;
const PAGE_SIZE = 5;

export async function fetchAnimals(needed: number): Promise<ThemeData[]> {
  if (needed > TOTAL_CARDS_AVAILABLE)
    throw new Error(
      `Cannot fetch more than ${TOTAL_CARDS_AVAILABLE} distinct cards`
    );

  const numPages = Math.ceil(TOTAL_CARDS_AVAILABLE / PAGE_SIZE);
  const maxUniquePages = Math.min(numPages, Math.ceil(needed / PAGE_SIZE));

  const selectedPages = new Set<number>();
  while (selectedPages.size < maxUniquePages)
    selectedPages.add(Math.floor(Math.random() * numPages) + 1);

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

  const allCards: ThemeData[] = responses.flatMap((res) =>
    res.data.entries.map((entry: any) => ({
      name: entry.meta?.name ?? `Unnamed-${Math.random()}`,
      imageUrl: entry.fields?.image?.url ?? "",
    }))
  );

  const validCards = allCards.filter((c) => c.name && c.imageUrl);
  const uniqueCards = Array.from(
    new Map(validCards.map((c) => [c.name, c])).values()
  );

  const shuffled = shuffleArray(uniqueCards);

  return shuffled.slice(0, needed);
}
