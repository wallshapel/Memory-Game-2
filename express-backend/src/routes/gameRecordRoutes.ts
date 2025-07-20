import { Router } from "express";
import { saveRecord, getTopRecords } from "../controllers/gameRecordController";

const router = Router();

router.post("/", saveRecord);     // POST /api/records
router.get("/", getTopRecords);   // GET /api/records

export default router;
