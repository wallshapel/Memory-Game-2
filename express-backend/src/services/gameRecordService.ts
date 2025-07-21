export interface GameRecordService {
  trySaveRecord(recordData: {
    name: string;
    difficulty: number;
    totalCards: number;
    hits: number;
    mistakes: number;
    time: number;
  }): Promise<boolean>;
}
