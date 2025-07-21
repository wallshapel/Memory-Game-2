import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import coverRoutes from "./routes/coverRoutes";
import userSettingsRoutes from "./routes/userSettingsRoutes";
import gameRecordRoutes from "./routes/gameRecordRoutes";
import { ROOT_PATH } from "./utils/rootPath";

dotenv.config();

const app = express();

const HOST = process.env.HOST;
const FRONTEND_PORT = process.env.FRONTEND_PORT;

app.use(
  cors({
    origin: "http://" + HOST + ":" + FRONTEND_PORT,
  })
);

app.use(morgan("dev"));
app.use(express.json());

// Serve static images for covers
app.use(
  "/uploads/images/covers",
  express.static(
    path.join(ROOT_PATH, "public", "uploads", "images", "covers")
  )
);

console.log(ROOT_PATH);

// API routes
app.use("/api/covers", coverRoutes);
app.use("/api/user-settings", userSettingsRoutes);
app.use("/api/records", gameRecordRoutes);

export default app;
