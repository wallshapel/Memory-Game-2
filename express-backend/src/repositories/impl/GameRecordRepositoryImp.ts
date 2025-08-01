// src/repositories/impl/GameRecordRepositoryImp.ts
import GameRecord from "../../models/GameRecord";
import { GameRecordRepository } from "../GameRecordRepository";
import { ISaveRecord, IGameRecord } from "../../interfaces/IGameRecord";

export class GameRecordRepositoryImp implements GameRecordRepository {
  async getTopRecords(limit: number): Promise<IGameRecord[]> {
    return await GameRecord.find({})
      .sort({
        totalCards: -1,
        time: 1,
        difficulty: -1,
        effectiveness: -1,
      })
      .limit(limit)
      .exec();
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
