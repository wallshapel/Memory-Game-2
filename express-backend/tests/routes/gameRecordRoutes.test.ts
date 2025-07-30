import request from "supertest";
import app from "../../src/app";
import mongoose from "mongoose";
import GameRecord from "../../src/models/GameRecord";
import { describe, it, beforeAll, afterAll, beforeEach, expect } from "vitest";

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI!);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Game Record Routes", () => {
  beforeEach(async () => {
    await GameRecord.deleteMany({});
  });

  it("should save a new valid record", async () => {
    const record = {
      username: "legato",
      name: "Record 1",
      time: 12000,
      totalCards: 20,
      difficulty: 2,
      attempts: 12,
      mistakes: 5,
      hits: 15,
      effectiveness: 1.67,
    };

    const res = await request(app).post("/api/records").send(record);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ saved: true });
  });

  it("should return top 20 records sorted properly", async () => {
    const samples = [
      {
        username: "a",
        name: "Record A",
        time: 10000,
        totalCards: 16,
        difficulty: 1,
        attempts: 10,
        mistakes: 3,
        hits: 13,
        effectiveness: 1.6,
      },
      {
        username: "b",
        name: "Record B",
        time: 9000,
        totalCards: 20,
        difficulty: 2,
        attempts: 8,
        mistakes: 2,
        hits: 18,
        effectiveness: 2.5,
      },
      {
        username: "c",
        name: "Record C",
        time: 8000,
        totalCards: 20,
        difficulty: 2,
        attempts: 7,
        mistakes: 1,
        hits: 19,
        effectiveness: 2.85,
      },
    ];

    await GameRecord.insertMany(samples);

    const res = await request(app).get("/api/records");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeLessThanOrEqual(20);
    expect(res.body[0].name).toBe("Record C");
  });
});
