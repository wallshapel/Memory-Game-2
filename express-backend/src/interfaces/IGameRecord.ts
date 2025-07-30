export interface IGameRecord extends Document {
  name: string;
  difficulty: number;
  totalCards: number;
  hits: number;
  mistakes: number;
  effectiveness: number; // calculated percentage
  time: number;
  createdAt: Date;
}

export interface ISaveRecord {
  name: string;
  difficulty: number;
  totalCards: number;
  hits: number;
  mistakes: number;
  time: number;
}
