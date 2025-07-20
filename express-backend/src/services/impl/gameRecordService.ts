import GameRecord from "../../models/GameRecord";
import type { GameRecordComparable } from "../../types/GameRecordComparabke";

/**
 * Attempts to save a new game record if it qualifies for the top 20.
 *
 * Sorting priority:
 *   1) totalCards (desc)
 *   2) time (asc)
 *   3) difficulty (desc)
 *   4) effectiveness (desc)
 *
 * @param recordData - Game stats: name, difficulty, totalCards, hits, mistakes, time
 * @returns true if the record was saved, false if not in top 20
 */
export const trySaveRecord = async (recordData: {
  name: string;
  difficulty: number;
  totalCards: number;
  hits: number;
  mistakes: number;
  time: number;
}): Promise<boolean> => {
  // Calculate effectiveness
  const attempts = recordData.hits + recordData.mistakes;
  const effectiveness =
    attempts === 0
      ? 0
      : parseFloat(((recordData.hits / attempts) * 100).toFixed(2));

  // Prepare the new record (without saving yet)
  const newRecord = {
    ...recordData,
    effectiveness,
  };

  // Find the current top 20 records (global)
  const topRecords = await GameRecord.find({})
    .sort({
      totalCards: -1,
      time: 1,
      difficulty: -1,
      effectiveness: -1,
    })
    .limit(20)
    .exec();

  // Check if the new record should be in the top 20
  let qualifies = false;
  if (topRecords.length < 20) {
    qualifies = true;
  } else {
    // Compare new record to the worst of the top 20
    const last = topRecords[topRecords.length - 1];
    const cmp = compareRecords(
      {
        totalCards: newRecord.totalCards,
        time: newRecord.time,
        difficulty: newRecord.difficulty,
        effectiveness: newRecord.effectiveness,
      },
      {
        totalCards: last.totalCards,
        time: last.time,
        difficulty: last.difficulty,
        effectiveness: last.effectiveness,
      }
    );
    qualifies = cmp < 0;
  }

  if (!qualifies) return false;

  // If top 20 is full, remove the worst record
  if (topRecords.length === 20) {
    const worst = topRecords[topRecords.length - 1];
    await GameRecord.findByIdAndDelete(worst._id);
  }

  // Save the new record
  await GameRecord.create(newRecord);
  return true;
};

/**
 * Compares two records for sorting.
 * Returns -1 if a is "better" than b, 1 if b is better, 0 if equal.
 */
function compareRecords(
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
