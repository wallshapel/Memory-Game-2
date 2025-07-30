import { Router } from "express";
import { saveRecord, getTopRecords } from "../controllers/gameRecordController";
import { getBestUserRecord } from "../controllers/recordController";

const router = Router();

router.post("/", saveRecord);                       // POST /api/records
router.get("/", getTopRecords);                     // GET /api/records
router.get("/best/:name", getBestUserRecord);       // GET /api/records/name/:name

export default router;
