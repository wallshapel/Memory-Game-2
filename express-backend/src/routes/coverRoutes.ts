import { Router } from "express";
import coverUpload from "../config/multer";

const router = Router();

/**
 * POST /api/covers
 * Upload a new cover image (PNG only, max 5MB).
 * Expects a file field named 'cover'.
 */
router.post("/", coverUpload.single("cover"), (req, res) => { // http://localhost:3000
  // File info is in req.file
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });
  // Send back just the filename (to save in user settings)
  return res.status(201).json({ filename: req.file.filename });
});

export default router;
