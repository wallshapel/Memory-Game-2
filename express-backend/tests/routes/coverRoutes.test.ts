import request from 'supertest'
import path from 'path'
import app from '../../src/app'
import { describe, it, expect, vi } from "vitest";

vi.mock("../../src/services/impl/coverServiceImp", () => {
  return {
    CoverServiceImpl: class {
      async processCoverUpload(username: string, filename: string) {
        return filename
      }
    }
  }
})

const imagePath = path.join(__dirname, '..', '__fixtures__', 'test-image.png')

describe("POST /api/covers", () => {
  it("should upload a file and respond with filename", async () => {
    const res = await request(app)
      .post("/api/covers")
      .field("username", "legato")
      .attach("cover", imagePath)

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("filename");
    expect(typeof res.body.filename).toBe("string");
  }, 10000);

  it("should return 400 if no file is uploaded", async () => {
    const res = await request(app)
      .post("/api/covers")
      .field("username", "legato");

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
});
