// tests/routes/userSettingsRoutes.test.ts
import request from "supertest";
import app from "../../src/app";
import { describe, it, expect, vi } from "vitest";

// MOCK THE PROVIDER (not the implementation)
vi.mock("../../src/providers/userSettingsServiceProvider", () => {
  return {
    userSettingsServiceProvider: () => ({
      saveOrUpdateUserSettings: vi.fn(async (data) => ({
        ...data,
        createdAt: new Date(),
      })),
      getLatestUserSettings: vi.fn(async () => ({
        name: "__test_user__",
        difficulty: 2,
        theme: 1,
        totalCards: 24,
        coverType: "default",
        controlMethod: "keyboard",
        background: 1,
        musicVolume: 80,
        musicMuted: false,
        effectsVolume: 60,
        effectsMuted: false,
        createdAt: new Date(),
      })),
      userExists: vi.fn(async (name) => name === "__test_user__"),
      getUserSettingsByName: vi.fn(async (name) =>
        name === "nouser"
          ? null
          : {
              name,
              difficulty: 2,
              theme: 1,
              totalCards: 24,
              coverType: "default",
              controlMethod: "keyboard",
              background: 1,
              musicVolume: 80,
              musicMuted: false,
              effectsVolume: 60,
              effectsMuted: false,
              createdAt: new Date(),
            }
      ),
    }),
  };
});

describe("User Settings Routes", () => {
  it("should save or update user settings", async () => {
    const res = await request(app).post("/api/user-settings").send({
      name: "__test_user__",
      difficulty: 2,
      theme: 1,
      totalCards: 24,
      coverType: "default",
      controlMethod: "keyboard",
      background: 1,
      musicVolume: 80,
      musicMuted: false,
      effectsVolume: 60,
      effectsMuted: false,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "__test_user__");
  });

  it("should fetch latest user settings", async () => {
    const res = await request(app).get("/api/user-settings/latest");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "__test_user__");
  });

  it("should return exists: true for an existing user", async () => {
    const res = await request(app).get(
      "/api/user-settings/exists/__test_user__"
    );
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ exists: true });
  });

  it("should return exists: false for a non-existing user", async () => {
    const res = await request(app).get("/api/user-settings/exists/nouser");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ exists: false });
  });

  it("should fetch settings by user name", async () => {
    const res = await request(app).get("/api/user-settings/name/__test_user__");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "__test_user__");
  });

  it("should return null if user settings not found", async () => {
    const res = await request(app).get("/api/user-settings/name/nouser");
    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });
});
