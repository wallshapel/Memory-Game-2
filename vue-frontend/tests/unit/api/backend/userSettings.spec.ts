// tests/unit/api/backend/userSettings.spec.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getLatestUserSettings,
  saveUserSettings,
  checkUserExists,
  getUserSettingsByName,
  getRecordByName,
} from "../../../../src/api/backend/userSettings";

vi.mock("../../../../src/api/backend/apiConfig", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));
import api from "../../../../src/api/backend/apiConfig";

const mockedGet = api.get as unknown as ReturnType<typeof vi.fn>;
const mockedPost = api.post as unknown as ReturnType<typeof vi.fn>;

describe("getLatestUserSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the most recent user settings object", async () => {
    const settings = { id: "1", username: "abel", theme: "dark" };
    mockedGet.mockResolvedValueOnce({ data: settings });

    const result = await getLatestUserSettings();
    expect(mockedGet).toHaveBeenCalledWith("/user-settings/latest");
    expect(result).toEqual(settings);
  });

  it("propagates API errors", async () => {
    mockedGet.mockRejectedValueOnce(new Error("fail"));
    await expect(getLatestUserSettings()).rejects.toThrow("fail");
  });

  it("sends the settings via POST and returns the response", async () => {
    const userSettings = { id: "1", username: "abel", theme: "light" };
    mockedPost.mockResolvedValueOnce({ data: userSettings });

    const result = await saveUserSettings(userSettings as any);
    expect(mockedPost).toHaveBeenCalledWith("/user-settings", userSettings);
    expect(result).toEqual(userSettings);
  });

  it("propagates API errors", async () => {
    mockedPost.mockRejectedValueOnce(new Error("fail"));
    await expect(saveUserSettings({} as any)).rejects.toThrow("fail");
  });

  it("returns true if the user exists", async () => {
    mockedGet.mockResolvedValueOnce({ data: { exists: true } });
    const result = await checkUserExists("abel");
    expect(mockedGet).toHaveBeenCalledWith("/user-settings/exists/abel");
    expect(result).toBe(true);
  });

  it("returns false if the user does NOT exist", async () => {
    mockedGet.mockResolvedValueOnce({ data: { exists: false } });
    const result = await checkUserExists("mery");
    expect(mockedGet).toHaveBeenCalledWith("/user-settings/exists/mery");
    expect(result).toBe(false);
  });

  it("propagates API errors", async () => {
    mockedGet.mockRejectedValueOnce(new Error("fail"));
    await expect(checkUserExists("abel")).rejects.toThrow("fail");
  });

  it("returns the settings of the requested user", async () => {
    const userSettings = { id: "7", username: "abel", theme: "dark" };
    mockedGet.mockResolvedValueOnce({ data: userSettings });
    const result = await getUserSettingsByName("abel");
    expect(mockedGet).toHaveBeenCalledWith("/user-settings/name/abel");
    expect(result).toEqual(userSettings);
  });

  it("propagates API errors", async () => {
    mockedGet.mockRejectedValueOnce(new Error("fail"));
    await expect(getUserSettingsByName("abel")).rejects.toThrow("fail");
  });

  it("returns the user's record if it exists", async () => {
    const userRecord = { id: "7", name: "abel", score: 19, time: 80 };
    mockedGet.mockResolvedValueOnce({ data: userRecord });
    const result = await getRecordByName("abel");
    expect(mockedGet).toHaveBeenCalledWith("/records/name/abel");
    expect(result).toEqual(userRecord);
  });

  it("returns null if the user has no record", async () => {
    mockedGet.mockResolvedValueOnce({ data: null });
    const result = await getRecordByName("noexiste");
    expect(mockedGet).toHaveBeenCalledWith("/records/name/noexiste");
    expect(result).toBeNull();
  });

  it("propagates API errors", async () => {
    mockedGet.mockRejectedValueOnce(new Error("fail"));
    await expect(getRecordByName("abel")).rejects.toThrow("fail");
  });
});
