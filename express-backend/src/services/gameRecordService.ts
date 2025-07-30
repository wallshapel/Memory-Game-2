import { ISaveRecord } from "../interfaces/IGameRecord";

export interface GameRecordService {
  trySaveRecord(recordData: ISaveRecord): Promise<boolean>;
}
