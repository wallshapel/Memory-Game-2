// src/repositories/GameRecordRepository.ts
import { ISaveRecord, IGameRecord } from "../interfaces/IGameRecord";

export interface GameRecordRepository {
  /**
   * Gets the top N records sorted with the game criteria.
   */
  getTopRecords(limit: number): Promise<IGameRecord[]>;

  /**
   * Saves a new game record.
   */
  createRecord(
    record: ISaveRecord & { effectiveness: number }
  ): Promise<IGameRecord>;

  /**
   * Deletes a record by its id.
   */
  deleteRecordById(id: string): Promise<void>;
}
