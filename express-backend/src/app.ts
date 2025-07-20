import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import coverRoutes from "./routes/coverRoutes";
import userSettingsRoutes from "./routes/userSettingsRoutes";
import gameRecordRoutes from "./routes/gameRecordRoutes";

dotenv.config();

const app = express();

app.use(morgan("dev"));
app.use(express.json());

// Serve static images for covers
app.use("/uploads/images/covers", express.static(path.join(__dirname, "..", "public", "uploads", "images", "covers")));

// API routes
app.use("/api/covers", coverRoutes);
app.use("/api/user-settings", userSettingsRoutes);
app.use("/api/records", gameRecordRoutes);

export default app;
