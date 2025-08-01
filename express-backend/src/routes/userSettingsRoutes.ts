// src/routes/userSettingsRoutes.ts
import { Router } from "express";
import {
  saveSettings,
  fetchLatestSettings,
  checkUserExists,
  fetchUserByName,
} from "../controllers/userSettingsController";
import { userSettingsServiceProvider } from "../providers/userSettingsServiceProvider";

const router = Router();
const service = userSettingsServiceProvider();

router.post("/", saveSettings(service)); // POST /api/user-settings
router.get("/latest", fetchLatestSettings(service)); // GET /api/user-settings/latest
router.get("/exists/:name", checkUserExists(service)); // GET /api/user-settings/exists/:name
router.get("/name/:name", fetchUserByName(service)); // GET /api/user-settings/name/:name

export default router;
