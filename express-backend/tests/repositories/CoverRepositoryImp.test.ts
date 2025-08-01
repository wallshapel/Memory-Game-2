// tests/repositories/CoverRepositoryImp.test.ts
import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { CoverRepositoryImp } from "../../src/repositories/impl/CoverRepositoryImp";
import UserSettings from "../../src/models/UserSettings";

describe("CoverRepositoryImp", () => {
  let mongoServer: MongoMemoryServer;
  let repository: CoverRepositoryImp;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    repository = new CoverRepositoryImp();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await UserSettings.deleteMany({});
  });

  it("should return coverFileName if found", async () => {
    await UserSettings.create({
      name: "__test_user__",
      difficulty: 1,
      theme: 1,
      totalCards: 10,
      coverType: "uploaded",
      coverFileName: "custom.jpg",
      controlMethod: "mouse",
      background: 0,
      musicVolume: 100,
      musicMuted: false,
      effectsVolume: 100,
      effectsMuted: false,
    });

    const result = await repository.findCoverByUsername("__test_user__");
    expect(result).toEqual({ coverFileName: "custom.jpg" });
  });

  it("should return null if user not found", async () => {
    const result = await repository.findCoverByUsername("nonexistent");
    expect(result).toBeNull();
  });

  it("should update coverFileName and coverType", async () => {
    await UserSettings.create({
      name: "userA",
      difficulty: 1,
      theme: 2,
      totalCards: 16,
      coverType: "default",
      controlMethod: "keyboard",
      background: 2,
      musicVolume: 70,
      musicMuted: false,
      effectsVolume: 60,
      effectsMuted: false,
    });

    await repository.updateCover("userA", "newcover.png", "uploaded");
    const updated = await UserSettings.findOne({ name: "userA" }).lean();

    expect(updated?.coverFileName).toBe("newcover.png");
    expect(updated?.coverType).toBe("uploaded");
  });

  it("should not create new user if username does not exist (upsert: false)", async () => {
    await repository.updateCover("notCreated", "file.png", "uploaded");
    const found = await UserSettings.findOne({ name: "notCreated" });
    expect(found).toBeNull();
  });
});
