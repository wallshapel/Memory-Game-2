import { Request, Response } from "express";
import { UserSettingsService } from "../services/userSettingsService";
import { UserSettingsServiceImpl } from "../services/impl/userSettingsServiceImp";

const userSettingsService: UserSettingsService = new UserSettingsServiceImpl();

// POST or PUT /api/user-settings
export const saveSettings = async (req: Request, res: Response) => {
  try {
    const settings = await userSettingsService.saveOrUpdateUserSettings(
      req.body
    );
    return res.status(200).json(settings);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

// GET /api/user-settings/latest
export const fetchLatestSettings = async (req: Request, res: Response) => {
  try {
    const settings = await userSettingsService.getLatestUserSettings();
    return res.status(200).json(settings || null);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};
