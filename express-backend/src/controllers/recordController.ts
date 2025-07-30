import { Request, Response } from "express";
import { RecordServiceImpl } from "../services/impl/recordServiceImpl";
import { RecordService } from "../services/recordService";

const recordService: RecordService = new RecordServiceImpl();

export const getTopRecords = async (req: Request, res: Response) => {
  try {
    const records = await recordService.getTopRecords();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch records" });
  }
};

export const saveRecord = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const saved = await recordService.save(data);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: "Failed to save record" });
  }
};

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
