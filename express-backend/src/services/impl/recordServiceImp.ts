// src/services/impl/recordServiceImp.ts
import { RecordService } from "../recordService";
import GameRecord from "../../models/GameRecord";
import { IGameRecord } from "../../interfaces/IGameRecord";

export class RecordServiceImp implements RecordService {
  async getTopRecords(): Promise<IGameRecord[]> {
    return (await GameRecord.find()
      .sort({ effectiveness: -1, time: 1 })
      .limit(20)
      .lean()) as IGameRecord[];
  }

  async save(
    record: Omit<IGameRecord, "effectiveness" | "createdAt">
  ): Promise<IGameRecord> {
    const effectiveness = (record.hits / (record.hits + record.mistakes)) * 100;
    return await GameRecord.create({ ...record, effectiveness });
  }

  async getBestUserRecord(name: string): Promise<IGameRecord | null> {
    return (await GameRecord.findOne({ name })
      .sort({ effectiveness: -1, time: 1 })
      .lean()) as IGameRecord | null;
  }
}
