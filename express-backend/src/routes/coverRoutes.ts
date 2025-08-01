// src/routes/coverRoutes.ts
import { Router } from "express";
import coverUpload from "../config/multer";
import { uploadCover } from "../controllers/coverController";
import { coverServiceProvider } from "../providers/coverServiceProvider";

const router = Router();

/**
 * POST /api/covers
 */
router.post(
  "/",
  coverUpload.single("cover"),
  uploadCover(coverServiceProvider())
);

export default router;
