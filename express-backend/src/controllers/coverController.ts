import { Request, Response } from "express";
import { coverService } from "../services/coverService";
import { CoverServiceImpl } from "../services/impl/coverServiceImp";

const coverService: coverService = new CoverServiceImpl();

// POST /api/covers
export const uploadCover = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });
    if (!username)
      return res.status(400).json({ error: "Username is required." });

    const filename = await coverService.processCoverUpload(
      username,
      req.file.filename
    );

    return res.status(201).json({ filename });
  } catch (err) {
    console.error("Error uploading cover:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
