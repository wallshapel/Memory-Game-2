// src/models/GameRecord.ts
import mongoose, { Schema } from "mongoose";
import { IGameRecord } from "../interfaces/IGameRecord";

const GameRecordSchema = new Schema<IGameRecord>(
  {
    name: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 18,
      match: /\S/, // not just spaces
    },
    difficulty: {
      type: Number,
      required: true,
    },
    totalCards: {
      type: Number,
      required: true,
    },
    hits: {
      type: Number,
      required: true,
    },
    mistakes: {
      type: Number,
      required: true,
    },
    effectiveness: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    time: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.model<IGameRecord>("GameRecord", GameRecordSchema);
