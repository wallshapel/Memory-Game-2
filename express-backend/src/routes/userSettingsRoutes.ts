import { Router } from "express";
import { saveSettings, fetchLatestSettings, checkUserExists, fetchUserByName } from "../controllers/userSettingsController";

const router = Router();

// Save or update user settings
router.post("/", saveSettings); // POST /api/user-settings

// Get most recent settings
router.get("/latest", fetchLatestSettings); // GET /api/user-settings/latest

// Check if user exists
router.get("/exists/:name", checkUserExists); // GET /api/user-settings/exists/:name

// Get settings by user name
router.get("/name/:name", fetchUserByName); // GET /api/user-settings/name/:name

export default router;
