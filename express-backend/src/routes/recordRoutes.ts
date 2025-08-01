// src/routes/recordRoutes.ts
import { Router } from "express";
import {
  saveRecord,
  getTopRecords,
  getBestUserRecord,
} from "../controllers/recordController";
import { recordServiceProvider } from "../providers/recordServiceProvider";

const router = Router();

const recordService = recordServiceProvider();

/**
 * @openapi
 * /api/records:
 *   post:
 *     summary: Save a new game record
 *     description: Saves a new record if it qualifies for the top 20.
 *     tags:
 *       - Records
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
 *               totalCards:
 *                 type: integer
 *               hits:
 *                 type: integer
 *               mistakes:
 *                 type: integer
 *               time:
 *                 type: integer
 *             required:
 *               - name
 *               - difficulty
 *               - totalCards
 *               - hits
 *               - mistakes
 *               - time
 *     responses:
 *       201:
 *         description: Record saved (in top 20)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 saved:
 *                   type: boolean
 *       200:
 *         description: Record not saved (not in top 20)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 saved:
 *                   type: boolean
 *                 reason:
 *                   type: string
 *       400:
 *         description: Error while saving record
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post("/", saveRecord(recordService)); // POST /api/records

/**
 * @openapi
 * /api/records:
 *   get:
 *     summary: Get top 20 records
 *     description: Returns the top 20 global records, sorted by difficulty, totalCards, effectiveness, and time.
 *     tags:
 *       - Records
 *     responses:
 *       200:
 *         description: List of top records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   difficulty:
 *                     type: integer
 *                   totalCards:
 *                     type: integer
 *                   hits:
 *                     type: integer
 *                   mistakes:
 *                     type: integer
 *                   effectiveness:
 *                     type: number
 *                   time:
 *                     type: integer
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Error retrieving records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get("/", getTopRecords(recordService)); // GET /api/records

/**
 * @openapi
 * /api/records/best/{name}:
 *   get:
 *     summary: Get best record for a user
 *     description: Returns the best record for the specified user.
 *     tags:
 *       - Records
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Username to search for
 *     responses:
 *       200:
 *         description: Best user record found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 difficulty:
 *                   type: integer
 *                 totalCards:
 *                   type: integer
 *                 hits:
 *                   type: integer
 *                 mistakes:
 *                   type: integer
 *                 effectiveness:
 *                   type: number
 *                 time:
 *                   type: integer
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: No record found for user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid user name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Error retrieving user record
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.get("/best/:name", getBestUserRecord(recordService)); // GET /api/records/best/:name

export default router;
