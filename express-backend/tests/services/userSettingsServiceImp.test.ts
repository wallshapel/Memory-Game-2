// tests/services/userSettingsServiceImp.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserSettingsServiceImp } from "../../src/services/impl/userSettingsServiceImp";
import {
  ISaveUpdateUserSettings,
  IUserSettings,
} from "../../src/interfaces/IUserSettings";

const saveOrUpdateUserSettings = vi.fn();
const getLatestUserSettings = vi.fn();
const userExists = vi.fn();
const getUserSettingsByName = vi.fn();

const repositoryMock = {
  saveOrUpdateUserSettings,
  getLatestUserSettings,
  userExists,
  getUserSettingsByName,
};

describe("UserSettingsServiceImp", () => {
  let service: UserSettingsServiceImp;

  beforeEach(() => {
    saveOrUpdateUserSettings.mockReset();
    getLatestUserSettings.mockReset();
    userExists.mockReset();
    getUserSettingsByName.mockReset();
    service = new UserSettingsServiceImp(repositoryMock as any);
  });

  it("should call repository.saveOrUpdateUserSettings and return result", async () => {
    const fakeData: ISaveUpdateUserSettings = {
      name: "__test_user__",
      difficulty: 2,
      theme: 1,
      totalCards: 16,
      coverType: "default",
      controlMethod: "mouse",
      background: 0,
      musicVolume: 70,
      musicMuted: false,
      effectsVolume: 80,
      effectsMuted: false,
    };
    const fakeSettings: IUserSettings = {
      ...fakeData,
      createdAt: new Date(),
    } as any;
    saveOrUpdateUserSettings.mockResolvedValueOnce(fakeSettings);

    const result = await service.saveOrUpdateUserSettings(fakeData);
    expect(saveOrUpdateUserSettings).toHaveBeenCalledWith(fakeData);
    expect(result).toBe(fakeSettings);
  });

  it("should call repository.getLatestUserSettings and return result", async () => {
    const settings = {
      name: "__test_user__",
      createdAt: new Date(),
    } as IUserSettings;
    getLatestUserSettings.mockResolvedValueOnce(settings);

    const result = await service.getLatestUserSettings();
    expect(getLatestUserSettings).toHaveBeenCalled();
    expect(result).toBe(settings);
  });

  it("should call repository.userExists and return result", async () => {
    userExists.mockResolvedValueOnce(true);

    const result = await service.userExists("__test_user__");
    expect(userExists).toHaveBeenCalledWith("__test_user__");
    expect(result).toBe(true);
  });

  it("should call repository.getUserSettingsByName and return result", async () => {
    const settings = {
      name: "__test_user__",
      createdAt: new Date(),
    } as IUserSettings;
    getUserSettingsByName.mockResolvedValueOnce(settings);

    const result = await service.getUserSettingsByName("__test_user__");
    expect(getUserSettingsByName).toHaveBeenCalledWith("__test_user__");
    expect(result).toBe(settings);
  });

  it("should propagate errors from repository", async () => {
    saveOrUpdateUserSettings.mockRejectedValueOnce(new Error("repo fail"));

    await expect(service.saveOrUpdateUserSettings({} as any)).rejects.toThrow(
      "repo fail"
    );
  });
});
