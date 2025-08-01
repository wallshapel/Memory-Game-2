// src/controllers/coverController.ts
import { Request, Response } from "express";
import { CoverService } from "../services/coverService";

// Receives CoverService as dependency injection
export const uploadCover =
  (coverService: CoverService) => async (req: Request, res: Response) => {
    try {
      const { username } = req.body;

      if (!req.file)
        return res.status(400).json({ error: "No file uploaded." });

      if (!username)
        return res.status(400).json({ error: "Username is required." });

      const filename = await coverService.processCoverUpload(
        username,
        req.file.filename
      );

      return res.status(201).json({ filename });
    } catch (err) {
      console.error("❌ Error uploading cover:", err);

      if (err instanceof Error)
        return res.status(500).json({ error: err.message });

      return res.status(500).json({ error: "Unknown server error" });
    }
  };
