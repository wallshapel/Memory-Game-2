import { Router } from "express";
import coverUpload from "../config/multer";
import { uploadCover } from "../controllers/coverController";

const router = Router();

/**
 * POST /api/covers
 */
router.post("/", coverUpload.single("cover"), uploadCover);

export default router;
