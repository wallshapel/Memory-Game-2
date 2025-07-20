import { Router } from "express";
import { saveSettings, fetchSettings } from "../controllers/userSettingsController";

const router = Router();

// Save or update user settings
router.post("/", saveSettings);      // POST /api/user-settings

// Get user settings by name
router.get("/:name", fetchSettings); // GET /api/user-settings/:name

export default router;
