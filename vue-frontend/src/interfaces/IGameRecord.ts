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
