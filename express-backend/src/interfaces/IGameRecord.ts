// src/interfaces/IGameRecord.ts
import { Types } from "mongoose";

export interface IGameRecord extends Document {
  _id: Types.ObjectId;
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
