import multer from "multer";
import path from "path";
import fs from "fs";
import { ROOT_PATH } from "../utils/rootPath";

// Directory for storing cover images (en raíz del proyecto)
const coversDir = path.join(ROOT_PATH, "public", "uploads", "images", "covers");

// Ensure directory exists (si quieres crearla solo si no existe)
fs.mkdirSync(coversDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, coversDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype !== "image/png")
    cb(new Error("Only PNG images are allowed"));
  else 
    cb(null, true);
};

const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
};

const coverUpload = multer({ storage, fileFilter, limits });

export default coverUpload;
