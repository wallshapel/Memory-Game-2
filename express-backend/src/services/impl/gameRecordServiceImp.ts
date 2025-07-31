import { ISaveRecord } from "../../interfaces/IGameRecord";
import GameRecord from "../../models/GameRecord";
import { compareRecords } from "../../utils/compareRecords";
import { GameRecordService } from "../gameRecordService";

export class GameRecordServiceImp implements GameRecordService {
  async trySaveRecord(recordData: ISaveRecord): Promise<boolean> {
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
    if (topRecords.length < 20)
      qualifies = true;
    else {
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

    if (topRecords.length === 20) {
      const worst = topRecords[topRecords.length - 1];
      await GameRecord.findByIdAndDelete(worst._id);
    }

    await GameRecord.create(newRecord);
    return true;
  }
}
