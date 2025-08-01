// src/services/recordService.ts
import { IGameRecord, ISaveRecord } from "../interfaces/IGameRecord";

export interface RecordService {
  saveRecord(
    record: ISaveRecord
  ): Promise<{ saved: boolean; reason?: string }>;
  getTopRecords(): Promise<IGameRecord[]>;
  getBestUserRecord(name: string): Promise<IGameRecord | null>;
}
