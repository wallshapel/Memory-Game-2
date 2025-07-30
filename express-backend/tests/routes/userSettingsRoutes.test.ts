import request from "supertest";
import app from "../../src/app";
import mongoose from "mongoose";
import UserSettings from "../../src/models/UserSettings";
import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI!);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("User Settings Routes", () => {
  beforeEach(async () => {
    await UserSettings.deleteMany({});
  });

  const basePayload = {
    name: "legato",
    difficulty: 2,
    theme: 1,
    totalCards: 16,
    coverType: "uploaded",
    coverFileName: "custom.png",
    controlMethod: "keyboard",
    background: 3,
    musicVolume: 80,
    musicMuted: false,
    effectsVolume: 70,
    effectsMuted: true,
  };

  it("should save new user settings", async () => {
    const res = await request(app).post("/api/user-settings").send(basePayload);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "legato");
    expect(res.body).toHaveProperty("coverFileName", "custom.png");
  });

  it("should retrieve latest settings", async () => {
    await UserSettings.create({ ...basePayload, name: "alpha" });

    const res = await request(app).get("/api/user-settings/latest");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "alpha");
  });

  it("should return exists=true for existing user", async () => {
    await UserSettings.create(basePayload);

    const res = await request(app).get("/api/user-settings/exists/legato");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ exists: true });
  });

  it("should return exists=false for non-existing user", async () => {
    const res = await request(app).get("/api/user-settings/exists/ghost");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ exists: false });
  });

  it("should fetch settings by name", async () => {
    await UserSettings.create(basePayload);

    const res = await request(app).get("/api/user-settings/name/legato");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("controlMethod", "keyboard");
    expect(res.body).toHaveProperty("effectsMuted", true);
  });
});
