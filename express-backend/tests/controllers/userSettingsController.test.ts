// tests/controllers/userSettingsController.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  saveSettings,
  fetchLatestSettings,
  checkUserExists,
  fetchUserByName,
} from "../../src/controllers/userSettingsController";

// Helper for mock Express response
const getMockRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("userSettingsController", () => {
  let userSettingsServiceMock: any;

  beforeEach(() => {
    userSettingsServiceMock = {
      saveOrUpdateUserSettings: vi.fn(),
      getLatestUserSettings: vi.fn(),
      userExists: vi.fn(),
      getUserSettingsByName: vi.fn(),
    };
  });

  it("should save or update user settings and return 200", async () => {
    const result = { name: "__test_user__", difficulty: 2 };
    userSettingsServiceMock.saveOrUpdateUserSettings.mockResolvedValueOnce(
      result
    );
    const req: any = { body: { name: "__test_user__", difficulty: 2 } };
    const res = getMockRes();

    await saveSettings(userSettingsServiceMock)(req, res);

    expect(
      userSettingsServiceMock.saveOrUpdateUserSettings
    ).toHaveBeenCalledWith({
      name: "__test_user__",
      difficulty: 2,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it("should return 400 if saveOrUpdateUserSettings throws error", async () => {
    userSettingsServiceMock.saveOrUpdateUserSettings.mockRejectedValueOnce(
      new Error("DB error")
    );
    const req: any = { body: { name: "__test_user__" } };
    const res = getMockRes();

    await saveSettings(userSettingsServiceMock)(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
  });

  it("should fetch latest settings and return 200", async () => {
    const settings = { name: "__test_user__" };
    userSettingsServiceMock.getLatestUserSettings.mockResolvedValueOnce(
      settings
    );
    const req: any = {};
    const res = getMockRes();

    await fetchLatestSettings(userSettingsServiceMock)(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(settings);
  });

  it("should fetch latest settings and return null if not found", async () => {
    userSettingsServiceMock.getLatestUserSettings.mockResolvedValueOnce(null);
    const req: any = {};
    const res = getMockRes();

    await fetchLatestSettings(userSettingsServiceMock)(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(null);
  });

  it("should return 400 if getLatestUserSettings throws error", async () => {
    userSettingsServiceMock.getLatestUserSettings.mockRejectedValueOnce(
      new Error("fail")
    );
    const req: any = {};
    const res = getMockRes();

    await fetchLatestSettings(userSettingsServiceMock)(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "fail" });
  });

  it("should check user exists and return true", async () => {
    userSettingsServiceMock.userExists.mockResolvedValueOnce(true);
    const req: any = { params: { name: "__test_user__" } };
    const res = getMockRes();

    await checkUserExists(userSettingsServiceMock)(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ exists: true });
  });

  it("should check user exists and return false", async () => {
    userSettingsServiceMock.userExists.mockResolvedValueOnce(false);
    const req: any = { params: { name: "nouser" } };
    const res = getMockRes();

    await checkUserExists(userSettingsServiceMock)(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ exists: false });
  });

  it("should return 400 if userExists throws error", async () => {
    userSettingsServiceMock.userExists.mockRejectedValueOnce(new Error("fail"));
    const req: any = { params: { name: "__test_user__" } };
    const res = getMockRes();

    await checkUserExists(userSettingsServiceMock)(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "fail" });
  });

  it("should fetch user by name and return 200 with user", async () => {
    const user = { name: "__test_user__", difficulty: 2 };
    userSettingsServiceMock.getUserSettingsByName.mockResolvedValueOnce(user);
    const req: any = { params: { name: "__test_user__" } };
    const res = getMockRes();

    await fetchUserByName(userSettingsServiceMock)(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(user);
  });

  it("should fetch user by name and return 200 with null if not found", async () => {
    userSettingsServiceMock.getUserSettingsByName.mockResolvedValueOnce(null);
    const req: any = { params: { name: "nouser" } };
    const res = getMockRes();

    await fetchUserByName(userSettingsServiceMock)(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(null);
  });

  it("should return 400 if getUserSettingsByName throws error", async () => {
    userSettingsServiceMock.getUserSettingsByName.mockRejectedValueOnce(
      new Error("fail")
    );
    const req: any = { params: { name: "__test_user__" } };
    const res = getMockRes();

    await fetchUserByName(userSettingsServiceMock)(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "fail" });
  });
});
