// src/services/impl/recordServiceImp.ts
import { RecordService } from "../recordService";
import { RecordRepository } from "../../repositories/RecordRepository";
import { IGameRecord, ISaveRecord } from "../../interfaces/IGameRecord";
import { compareRecords } from "../../utils/compareRecords";

export class RecordServiceImp implements RecordService {
  private repository: RecordRepository;

  constructor(repository: RecordRepository) {
    this.repository = repository;
  }

  async saveRecord(
    record: ISaveRecord
  ): Promise<{ saved: boolean; reason?: string }> {
    const attempts = record.hits + record.mistakes;
    const effectiveness =
      attempts === 0
        ? 0
        : parseFloat(((record.hits / attempts) * 100).toFixed(2));
    const newRecord = { ...record, effectiveness };

    // Get current top 20 records sorted
    const topRecords = await this.repository.getTopRecords(20);

    let qualifies = false;
    if (topRecords.length < 20)
      qualifies = true;
    else {
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

    if (!qualifies)
      return { saved: false, reason: "Not in top 20" };

    if (topRecords.length === 20) {
      const worst = topRecords[topRecords.length - 1];
      await this.repository.deleteRecordById(worst._id.toString());
    }

    await this.repository.createRecord(newRecord);
    return { saved: true };
  }

  async getTopRecords(): Promise<IGameRecord[]> {
    return this.repository.getTopRecords(20);
  }

  async getBestUserRecord(name: string): Promise<IGameRecord | null> {
    return this.repository.getBestUserRecord(name);
  }
}
