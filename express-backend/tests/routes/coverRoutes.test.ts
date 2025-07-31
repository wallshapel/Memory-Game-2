import request from "supertest";
import path from "path";
import app from "../../src/app";
import { describe, it, expect, vi, afterAll } from "vitest";
import fs from "fs/promises";
import UserSettings from "../../src/models/UserSettings";

vi.mock("../../src/services/impl/coverServiceImp", () => {
  return {
    CoverServiceImpl: class {
      async processCoverUpload(username: string, filename: string) {
        return filename;
      }
    },
  };
});

const imagePath = path.join(__dirname, "..", "__fixtures__", "test-image.png");

describe("POST /api/covers", () => {
  it("should upload a file and respond with filename", async () => {
    const res = await request(app)
      .post("/api/covers")
      .field("username", "__test_user__")
      .attach("cover", imagePath);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("filename");
  });

  it("should return 400 if no file is uploaded", async () => {
    const res = await request(app)
      .post("/api/covers")
      .field("username", "__test_user__");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "No file uploaded." });
  });

  it("should return 400 if no username is provided", async () => {
    const res = await request(app)
      .post("/api/covers")
      .attach("cover", imagePath);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Username is required." });
  });

  afterAll(async () => {
    const dir = path.join(__dirname, "../../public/uploads/images/covers");

    try {
      const files = await fs.readdir(dir);
      const testFiles = files.filter(
        (f) => f.includes("test-image") || f.includes("custom.png")
      );
      await Promise.all(
        testFiles.map((f) =>
          fs
            .unlink(path.join(dir, f))
            .catch((err) =>
              console.warn(`⚠️ Error deleting ${f}: ${err.message}`)
            )
        )
      );
    } catch (err: any) {
      console.warn(`⚠️ Error reading cover directory: ${err.message}`);
    }

    try {
      await UserSettings.deleteMany({
        name: { $in: ["__test_user__", "alpha"] },
      });
    } catch (err: any) {
      console.warn(`⚠️ Error cleaning test user settings: ${err.message}`);
    }
  }, 30000);
});
