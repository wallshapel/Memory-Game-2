// tests/repositories/UserSettingsRepositoryImp.test.ts
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { UserSettingsRepositoryImp } from "../../src/repositories/impl/UserSettingsRepositoryImp";
import UserSettings from "../../src/models/UserSettings";
import { ISaveUpdateUserSettings } from "../../src/interfaces/IUserSettings";

describe("UserSettingsRepositoryImp", () => {
  let mongoServer: MongoMemoryServer;
  let repository: UserSettingsRepositoryImp;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    repository = new UserSettingsRepositoryImp();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await UserSettings.deleteMany({});
  });

  it("should save or update user settings", async () => {
    const data: ISaveUpdateUserSettings = {
      name: "__test_user__",
      difficulty: 2,
      theme: 1,
      totalCards: 16,
      coverType: "default",
      controlMethod: "mouse",
      background: 0,
      musicVolume: 100,
      musicMuted: false,
      effectsVolume: 100,
      effectsMuted: false,
    };
    const saved = await repository.saveOrUpdateUserSettings(data);
    expect(saved.name).toBe("__test_user__");
    expect(saved.difficulty).toBe(2);
  });

  it("should get latest user settings", async () => {
    await UserSettings.create({
      name: "user1",
      difficulty: 1,
      theme: 1,
      totalCards: 10,
      coverType: "default",
      controlMethod: "mouse",
      background: 0,
      musicVolume: 100,
      musicMuted: false,
      effectsVolume: 100,
      effectsMuted: false,
    });
    const latest = await repository.getLatestUserSettings();
    expect(latest).not.toBeNull();
  });

  it("should check if user exists", async () => {
    await UserSettings.create({
      name: "exists",
      difficulty: 1,
      theme: 1,
      totalCards: 10,
      coverType: "default",
      controlMethod: "mouse",
      background: 0,
      musicVolume: 100,
      musicMuted: false,
      effectsVolume: 100,
      effectsMuted: false,
    });
    const exists = await repository.userExists("exists");
    expect(exists).toBe(true);
    const notExists = await repository.userExists("nope");
    expect(notExists).toBe(false);
  });

  it("should get user settings by name", async () => {
    await UserSettings.create({
      name: "lookup",
      difficulty: 1,
      theme: 1,
      totalCards: 10,
      coverType: "default",
      controlMethod: "mouse",
      background: 0,
      musicVolume: 100,
      musicMuted: false,
      effectsVolume: 100,
      effectsMuted: false,
    });
    const found = await repository.getUserSettingsByName("lookup");
    expect(found?.name).toBe("lookup");
  });
});
