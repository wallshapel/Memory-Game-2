// src/repositories/impl/RecordRepositoryImp.ts
import { RecordRepository } from "../RecordRepository";
import GameRecord from "../../models/GameRecord";
import { IGameRecord, ISaveRecord } from "../../interfaces/IGameRecord";

export class RecordRepositoryImp implements RecordRepository {
  async getTopRecords(limit: number): Promise<IGameRecord[]> {
    return (await GameRecord.find({})
      .sort({
        difficulty: -1,
        totalCards: -1,
        effectiveness: -1,
        time: 1,
      })
      .limit(limit)
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

  async createRecord(
    record: ISaveRecord & { effectiveness: number }
  ): Promise<IGameRecord> {
    return await GameRecord.create(record);
  }

  async deleteRecordById(id: string): Promise<void> {
    await GameRecord.findByIdAndDelete(id);
  }
}
