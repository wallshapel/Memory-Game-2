import { Request, Response } from "express";
import { saveOrUpdateUserSettings, getUserSettings } from "../services/userSettingsService";

// POST or PUT /api/user-settings
export const saveSettings = async (req: Request, res: Response) => {
  try {
    const settings = await saveOrUpdateUserSettings(req.body);
    return res.status(200).json(settings);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

// GET /api/user-settings/:name
export const fetchSettings = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const settings = await getUserSettings(name);
    if (!settings) return res.status(404).json({ error: "User not found" });
    return res.json(settings);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};
