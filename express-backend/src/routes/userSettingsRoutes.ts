import { Router } from "express";
import { saveSettings, fetchLatestSettings } from "../controllers/userSettingsController";

const router = Router();

// Save or update user settings
router.post("/", saveSettings);             // POST /api/user-settings

router.get("/latest", fetchLatestSettings); // GET /api/user-settings/latest

export default router;
