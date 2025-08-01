// src/routes/coverRoutes.ts
import { Router } from "express";
import coverUpload from "../config/multer";
import { uploadCover } from "../controllers/coverController";
import { coverServiceProvider } from "../providers/coverServiceProvider";

const router = Router();

/**
 * @openapi
 * /api/covers:
 *   post:
 *     summary: Upload a cover image
 *     description: Uploads a PNG image to be used as a cover for a user.
 *     tags:
 *       - Covers
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username associated with the cover
 *               cover:
 *                 type: string
 *                 format: binary
 *                 description: Cover image file (PNG)
 *     responses:
 *       201:
 *         description: Cover uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 filename:
 *                   type: string
 *                   description: Name of the uploaded file
 *       400:
 *         description: No file uploaded or username missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.post(
  "/",
  coverUpload.single("cover"),
  uploadCover(coverServiceProvider())
);

export default router;
