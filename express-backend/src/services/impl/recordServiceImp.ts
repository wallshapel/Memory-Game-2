// src/services/impl/recordServiceImp.ts
import { RecordService } from "../recordService";
import GameRecord from "../../models/GameRecord";
import { IGameRecord, ISaveRecord } from "../../interfaces/IGameRecord";
import { compareRecords } from "../../utils/compareRecords";

export class RecordServiceImp implements RecordService {
  async saveRecord(
    record: ISaveRecord
  ): Promise<{ saved: boolean; reason?: string }> {
    // Calculate effectiveness
    const attempts = record.hits + record.mistakes;
    const effectiveness =
      attempts === 0
        ? 0
        : parseFloat(((record.hits / attempts) * 100).toFixed(2));
    const newRecord = { ...record, effectiveness };

    // Get current top 20 records with the right sort order!
    const topRecords = await GameRecord.find({})
      .sort({
        difficulty: -1,
        totalCards: -1,
        effectiveness: -1,
        time: 1,
      })
      .limit(20)
      .exec();

    let qualifies = false;
    if (topRecords.length < 20) {
      qualifies = true;
    } else {
      const last = topRecords[topRecords.length - 1];
      const cmp = compareRecords(
        {
          difficulty: newRecord.difficulty,
          totalCards: newRecord.totalCards,
          effectiveness: newRecord.effectiveness,
          time: newRecord.time,
        },
        {
          difficulty: last.difficulty,
          totalCards: last.totalCards,
          effectiveness: last.effectiveness,
          time: last.time,
        }
      );
      qualifies = cmp < 0;
    }

    if (!qualifies) {
      return { saved: false, reason: "Not in top 20" };
    }

    if (topRecords.length === 20) {
      const worst = topRecords[topRecords.length - 1];
      await GameRecord.findByIdAndDelete(worst._id);
    }

    await GameRecord.create(newRecord);
    return { saved: true };
  }

  async getTopRecords(): Promise<IGameRecord[]> {
    return (await GameRecord.find({})
      .sort({
        difficulty: -1,
        totalCards: -1,
        effectiveness: -1,
        time: 1,
      })
      .limit(20)
      .lean()) as IGameRecord[];
  }

  async getBestUserRecord(name: string): Promise<IGameRecord | null> {
    return (await GameRecord.findOne({ name })
      .sort({
        totalCards: -1,
        time: 1,
        difficulty: -1,
        effectiveness: -1,
      })
      .lean()) as IGameRecord | null;
  }
}
