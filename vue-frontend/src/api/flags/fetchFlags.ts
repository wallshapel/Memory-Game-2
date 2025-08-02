// src/api/flags/fetchFlags.ts
import type { IThemeData } from "../../interfaces/IThemeData";
import { shuffleArray } from "../../utils/shuffleArray";
import { COUNTRY_CODES } from "../../utils/countryCodes";

/**
 * Returns an array of flag data objects, randomly selected from a fixed list of country codes.
 *
 * @param needed Number of flags requested
 * @returns Array of IThemeData with id, name and imageUrl
 * @throws Error if requested number exceeds available country codes or is invalid
 */
export async function fetchFlags(needed: number): Promise<IThemeData[]> {
  if (needed <= 0) return [];

  if (needed > COUNTRY_CODES.length) {
    throw new Error(
      `Cannot fetch more than ${COUNTRY_CODES.length} distinct flags`
    );
  }

  const shuffledCodes = shuffleArray(COUNTRY_CODES);
  const selected = shuffledCodes.slice(0, needed);

  return selected.map((code) => ({
    id: code,
    name: code,
    imageUrl: `https://flagsapi.com/${code}/shiny/64.png`,
  }));
}
