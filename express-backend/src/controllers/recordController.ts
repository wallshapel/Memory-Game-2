// src/controllers/recordController.ts
import { Request, Response } from "express";
import { RecordService } from "../services/recordService";
import { RecordServiceImp } from "../services/impl/recordServiceImp";

const recordService: RecordService = new RecordServiceImp();

/**
 * POST /api/records
 * Tries to save a new game record in the top 20.
 * Responds with { saved: true } if saved, or { saved: false, reason } if not.
 */
export const saveRecord = async (req: Request, res: Response) => {
  try {
    const result = await recordService.saveRecord(req.body);
    if (result.saved) return res.status(201).json({ saved: true });
    return res.status(200).json({ saved: false, reason: result.reason });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/records
 * Returns the top 20 records globally, sorted according to your criteria.
 */
export const getTopRecords = async (_req: Request, res: Response) => {
  try {
    const records = await recordService.getTopRecords();
    return res.json(records);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

/**
 * GET /api/records/best/:name
 * Returns the best record for a given user.
 */
export const getBestUserRecord = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    if (!name || name.trim().length === 0)
      return res.status(400).json({ error: "Invalid user name" });

    const record = await recordService.getBestUserRecord(name);
    if (!record) return res.status(404).json({ message: "No record found" });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: "Failed to get user record" });
  }
};
