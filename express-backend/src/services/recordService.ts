import { IGameRecord } from "../interfaces/IGameRecord";

export interface RecordService {
  getTopRecords(): Promise<IGameRecord[]>;
  save(record: Omit<IGameRecord, "effectiveness" | "createdAt">): Promise<IGameRecord>;
  getBestUserRecord(name: string): Promise<IGameRecord | null>;
}
