// tests/routes/recordRoutes.test.ts
import request from "supertest";
import app from "../../src/app";
import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import UserSettings from "../../src/models/UserSettings";
import GameRecord from "../../src/models/GameRecord";

// MOCK THE PROVIDER (not the implementation)
vi.mock("../../src/providers/recordServiceProvider", () => {
  return {
    recordServiceProvider: () => ({
      saveRecord: vi.fn(async (data) => {
        // Simple logic for mock, you can customize this per test
        if (!data.name) return { saved: false, reason: "Missing name" };
        if (data.name === "fails") throw new Error("Failed to save");
        if (data.name === "notop")
          return { saved: false, reason: "Not in top 20" };
        return { saved: true };
      }),
      getTopRecords: vi.fn(async () => [
        {
          _id: "123",
          name: "Legato",
          difficulty: 3,
          totalCards: 32,
          hits: 28,
          mistakes: 2,
          effectiveness: 93.3,
          time: 97,
          createdAt: new Date(),
        },
      ]),
      getBestUserRecord: vi.fn(async (name: string) => {
        if (name === "norecord") return null;
        return {
          _id: "456",
          name,
          difficulty: 3,
          totalCards: 32,
          hits: 30,
          mistakes: 2,
          effectiveness: 93.8,
          time: 90,
          createdAt: new Date(),
        };
      }),
    }),
  };
});

describe("Record Routes", () => {
  beforeEach(async () => {
    // Clean database or set up fixtures if needed
    await GameRecord.deleteMany({});
    await UserSettings.deleteMany({});
  });

  it("should save a record successfully", async () => {
    const res = await request(app).post("/api/records").send({
      name: "Legato",
      difficulty: 3,
      totalCards: 32,
      hits: 28,
      mistakes: 2,
      time: 97,
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ saved: true });
  });

  it("should not save if not in top 20", async () => {
    const res = await request(app).post("/api/records").send({
      name: "notop",
      difficulty: 2,
      totalCards: 24,
      hits: 20,
      mistakes: 3,
      time: 105,
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ saved: false, reason: "Not in top 20" });
  });

  it("should return 400 if saving throws an error", async () => {
    const res = await request(app).post("/api/records").send({
      name: "fails",
      difficulty: 3,
      totalCards: 24,
      hits: 20,
      mistakes: 3,
      time: 105,
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Failed to save");
  });

  it("should get top records", async () => {
    const res = await request(app).get("/api/records");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("name", "Legato");
  });

  it("should get best user record", async () => {
    const res = await request(app).get("/api/records/best/Legato");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "Legato");
  });

  it("should return 404 if user has no record", async () => {
    const res = await request(app).get("/api/records/best/norecord");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "No record found" });
  });

  it("should return 400 for invalid user name", async () => {
    const res = await request(app).get("/api/records/best/ ");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid user name" });
  });

  afterAll(async () => {
    // Clean up if needed
    await GameRecord.deleteMany({});
    await UserSettings.deleteMany({});
  });
});
