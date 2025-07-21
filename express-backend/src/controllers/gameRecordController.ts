import { Request, Response } from "express";
import { GameRecordService } from "../services/gameRecordService";
import { GameRecordServiceImpl } from "../services/impl/gameRecordServiceImp";
import GameRecord from "../models/GameRecord";

const gameRecordService: GameRecordService = new GameRecordServiceImpl();

/**
 * POST /api/records
 * Tries to save a new game record in the top 20
 */
export const saveRecord = async (req: Request, res: Response) => {
  try {
    const ok = await gameRecordService.trySaveRecord(req.body);
    if (ok) return res.status(201).json({ saved: true });
    return res.status(200).json({ saved: false, reason: "Not in top 20" });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/records
 * Returns the top 20 records globally, sorted according to your criteria
 */
export const getTopRecords = async (_req: Request, res: Response) => {
  try {
    const records = await GameRecord.find({})
      .sort({
        totalCards: -1,
        time: 1,
        difficulty: -1,
        effectiveness: -1,
      })
      .limit(20)
      .exec();
    return res.json(records);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};
