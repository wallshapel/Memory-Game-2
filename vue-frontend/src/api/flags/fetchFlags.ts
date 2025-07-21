import type { IThemeData } from "../../interfaces/IThemeData";
import { shuffleArray } from "../../utils/shuffleArray";
import { COUNTRY_CODES } from "../../utils/countryCodes";

export async function fetchFlags(needed: number): Promise<IThemeData[]> {
  if (needed > COUNTRY_CODES.length) {
    throw new Error(`Cannot fetch more than ${COUNTRY_CODES.length} distinct flags`);
  }

  const shuffledCodes = shuffleArray(COUNTRY_CODES);
  const selected = shuffledCodes.slice(0, needed);

  return selected.map(code => ({
    id: code,
    name: code,
    imageUrl: `https://flagsapi.com/${code}/shiny/64.png`
  }));
}
