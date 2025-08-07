export interface IGameRecord {
  name: string;
  difficulty: number;
  totalCards: number;
  hits: number;
  mistakes: number;
  effectiveness: number;
  time: number;
  createdAt?: string;
}

export interface ISaveRecord {
  name: string;
  difficulty: number;
  totalCards: number;
  hits: number;
  mistakes: number;
  time: number;
}

export interface IGameRecordWithId extends IGameRecord {
  _id: string
}