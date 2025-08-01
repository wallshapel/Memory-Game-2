// src/repositories/RecordRepository.ts
import { IGameRecord, ISaveRecord } from "../interfaces/IGameRecord";

export interface RecordRepository {
  /**
   * Returns the top N records sorted according to game criteria.
   */
  getTopRecords(limit: number): Promise<IGameRecord[]>;

  /**
   * Returns the best record for a given user name.
   */
  getBestUserRecord(name: string): Promise<IGameRecord | null>;

  /**
   * Saves a new record.
   */
  createRecord(
    record: ISaveRecord & { effectiveness: number }
  ): Promise<IGameRecord>;

  /**
   * Deletes a record by its id.
   */
  deleteRecordById(id: string): Promise<void>;
}
