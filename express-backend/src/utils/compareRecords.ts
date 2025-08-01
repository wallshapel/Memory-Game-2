// src/utils/compareRecords.ts
import { GameRecordComparable } from "../types/GameRecordComparabke";

export function compareRecords(
  a: GameRecordComparable,
  b: GameRecordComparable
): number {
  // Difficulty DESC (Hard > Medium > Easy)
  if (a.difficulty !== b.difficulty) return b.difficulty - a.difficulty;
  // Total cards DESC
  if (a.totalCards !== b.totalCards) return b.totalCards - a.totalCards;
  // Effectiveness DESC
  if (a.effectiveness !== b.effectiveness)
    return b.effectiveness - a.effectiveness;
  // Time ASC (less is better)
  if (a.time !== b.time) return a.time - b.time;
  return 0;
}
