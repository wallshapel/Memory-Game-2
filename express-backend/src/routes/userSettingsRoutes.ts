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

/**
 * @openapi
 * /api/user-settings:
 *   post:
 *     summary: Save or update user settings
 *     description: Save new or update existing settings for a user.
 *     tags:
 *       - User Settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               difficulty:
 *                 type: integer
 *               theme:
 *                 type: integer
 *               totalCards:
 *                 type: integer
 *               coverType:
 *                 type: string
 *                 enum:
 *                   - default
 *                   - uploaded
 *               coverFileName:
 *                 type: string
 *               controlMethod:
 *                 type: string
 *                 enum:
 *                   - mouse
 *                   - keyboard
 *               background:
 *                 type: integer
 *               musicVolume:
 *                 type: integer
 *               musicMuted:
 *                 type: boolean
 *               effectsVolume:
 *                 type: integer
 *               effectsMuted:
 *                 type: boolean
 *             required:
 *               - name
 *               - difficulty
 *               - theme
 *               - totalCards
 *               - coverType
 *               - controlMethod
 *               - background
 *               - musicVolume
 *               - musicMuted
 *               - effectsVolume
 *               - effectsMuted
 *     responses:
 *       200:
 *         description: Settings saved or updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSettings'
 *       400:
 *         description: Error saving/updating settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post("/", saveSettings(service)); // POST /api/user-settings

/**
 * @openapi
 * /api/user-settings/latest:
 *   get:
 *     summary: Get latest user settings
 *     description: Returns the most recently saved user settings.
 *     tags:
 *       - User Settings
 *     responses:
 *       200:
 *         description: Latest settings or null if none exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSettings'
 *       400:
 *         description: Error fetching latest settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get("/latest", fetchLatestSettings(service)); // GET /api/user-settings/latest

/**
 * @openapi
 * /api/user-settings/exists/{name}:
 *   get:
 *     summary: Check if user exists
 *     description: Returns whether a user with the specified name exists.
 *     tags:
 *       - User Settings
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Username to check
 *     responses:
 *       200:
 *         description: Existence result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *       400:
 *         description: Error checking user existence
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get("/exists/:name", checkUserExists(service)); // GET /api/user-settings/exists/:name

/**
 * @openapi
 * /api/user-settings/name/{name}:
 *   get:
 *     summary: Get settings by user name
 *     description: Returns the settings for a given user.
 *     tags:
 *       - User Settings
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Username to search for
 *     responses:
 *       200:
 *         description: User settings found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSettings'
 *       400:
 *         description: Error fetching settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get("/name/:name", fetchUserByName(service)); // GET /api/user-settings/name/:name

export default router;

/**
 * @openapi
 * components:
 *   schemas:
 *     UserSettings:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         difficulty:
 *           type: integer
 *         theme:
 *           type: integer
 *         totalCards:
 *           type: integer
 *         coverType:
 *           type: string
 *           enum:
 *             - default
 *             - uploaded
 *         coverFileName:
 *           type: string
 *         controlMethod:
 *           type: string
 *           enum:
 *             - mouse
 *             - keyboard
 *         background:
 *           type: integer
 *         musicVolume:
 *           type: integer
 *         musicMuted:
 *           type: boolean
 *         effectsVolume:
 *           type: integer
 *         effectsMuted:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */
