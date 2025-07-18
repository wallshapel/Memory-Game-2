import type { ThemeData } from "../types/ThemeData";
import { GAME_THEMES } from "../constants/assets";
import { fetchAnimals } from "./animals/fetchAnimals";
import { fetchFlags } from "./flags/fetchFlags";
import { fetchCharacters } from "./rickandmorty/fetchCharacters";

type ThemeFetcher = (needed: number) => Promise<ThemeData[]>;

export const themeFetchers: Record<keyof typeof GAME_THEMES, ThemeFetcher> = {
  0: fetchAnimals,
  1: fetchCharacters,
  2: fetchFlags
};
