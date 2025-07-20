import GameRecord from "../models/GameRecord";
import { IGameRecord } from "../interfaces/IGameRecord";

/**
 * Attempts to save a new game record if it qualifies for the top 20.
 *
 * Sorting priority:
 *   1) totalCards (desc)
 *   2) time (asc)
 *   3) difficulty (desc)
 *   4) effectiveness (desc)
 *
 * @param recordData - Basic game stats: name, difficulty, totalCards, hits, mistakes, time
 * @returns true if the record was saved, false if it did not qualify
 */
export const trySaveRecord = async (recordData: {
  name: string;
  difficulty: number;
  totalCards: number;
  hits: number;
  mistakes: number;
  time: number;
}): Promise<boolean> => {
  // TODO: Calculate effectiveness and insert only if within the top 20 (see priority above)
  return false;
};
