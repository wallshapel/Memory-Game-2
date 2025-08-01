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

router.post("/", saveRecord(recordService)); // POST /api/records
router.get("/", getTopRecords(recordService)); // GET /api/records
router.get("/best/:name", getBestUserRecord(recordService)); // GET /api/records/best/:name

export default router;
