// src/controllers/userSettingsController.ts
import { Request, Response } from "express";
import { UserSettingsService } from "../services/userSettingsService";

const UNKNOWN_ERROR_MSG = "Unknown error";

// POST or PUT /api/user-settings
export const saveSettings =
  (service: UserSettingsService) => async (req: Request, res: Response) => {
    try {
      const settings = await service.saveOrUpdateUserSettings(req.body);
      return res.status(200).json(settings);
    } catch (err: unknown) {
      if (err instanceof Error) 
        return res.status(400).json({ error: err.message });
      return res.status(400).json({ error: UNKNOWN_ERROR_MSG });
    }
  };

// GET /api/user-settings/latest
export const fetchLatestSettings =
  (service: UserSettingsService) => async (_req: Request, res: Response) => {
    try {
      const settings = await service.getLatestUserSettings();
      return res.status(200).json(settings || null);
    } catch (err: unknown) {
      if (err instanceof Error)
        return res.status(400).json({ error: err.message });
      return res.status(400).json({ error: UNKNOWN_ERROR_MSG });
    }
  };

// GET /api/user-settings/exists/:name
export const checkUserExists =
  (service: UserSettingsService) => async (req: Request, res: Response) => {
    try {
      const name = req.params.name;
      const exists = await service.userExists(name);
      return res.status(200).json({ exists });
    } catch (err: unknown) {
      if (err instanceof Error)
        return res.status(400).json({ error: err.message });
      return res.status(400).json({ error: UNKNOWN_ERROR_MSG });
    }
  };

// GET /api/user-settings/name/:name
export const fetchUserByName =
  (service: UserSettingsService) => async (req: Request, res: Response) => {
    try {
      const name = req.params.name;
      const settings = await service.getUserSettingsByName(name);
      return res.status(200).json(settings);
    } catch (err: unknown) {
      if (err instanceof Error)
        return res.status(400).json({ error: err.message });
      return res.status(400).json({ error: UNKNOWN_ERROR_MSG });
    }
  };
