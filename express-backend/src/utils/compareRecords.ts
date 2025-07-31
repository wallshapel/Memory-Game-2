// src/utils/compareRecords.ts
import { GameRecordComparable } from "../types/GameRecordComparabke";
export function compareRecords(
  a: GameRecordComparable,
  b: GameRecordComparable
): number {
  if (a.totalCards !== b.totalCards) return b.totalCards - a.totalCards; // DESC
  if (a.time !== b.time) return a.time - b.time; // ASC
  if (a.difficulty !== b.difficulty) return b.difficulty - a.difficulty; // DESC
  if (a.effectiveness !== b.effectiveness)
    return b.effectiveness - a.effectiveness; // DESC
  return 0;
}
