// src/routes/recordRoutes.ts
import { Router } from "express";
import {
  saveRecord,
  getTopRecords,
  getBestUserRecord,
} from "../controllers/recordController";

const router = Router();

router.post("/", saveRecord); // POST /api/records
router.get("/", getTopRecords); // GET /api/records
router.get("/best/:name", getBestUserRecord); // GET /api/records/best/:name

export default router;
