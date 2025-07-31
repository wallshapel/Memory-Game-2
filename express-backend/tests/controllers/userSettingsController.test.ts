import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock service methods before importing the controller
const mockSaveOrUpdateUserSettings = vi.fn();
const mockGetLatestUserSettings = vi.fn();
const mockUserExists = vi.fn();
const mockGetUserSettingsByName = vi.fn();

vi.doMock("../../src/services/impl/userSettingsServiceImp", () => {
  return {
    UserSettingsServiceImpl: vi.fn().mockImplementation(() => ({
      saveOrUpdateUserSettings: mockSaveOrUpdateUserSettings,
      getLatestUserSettings: mockGetLatestUserSettings,
      userExists: mockUserExists,
      getUserSettingsByName: mockGetUserSettingsByName,
    })),
  };
});

// Helper to mock res object
function mockResponse() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("userSettingsController", () => {
  let saveSettings: any,
    fetchLatestSettings: any,
    checkUserExists: any,
    fetchUserByName: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const controller = await import(
      "../../src/controllers/userSettingsController"
    );
    saveSettings = controller.saveSettings;
    fetchLatestSettings = controller.fetchLatestSettings;
    checkUserExists = controller.checkUserExists;
    fetchUserByName = controller.fetchUserByName;
  });

  describe("saveSettings", () => {
    it("responds 200 with saved settings", async () => {
      const body = {
        name: "TestUser",
        difficulty: 2,
        theme: 1,
        totalCards: 16,
        coverType: "default",
        controlMethod: "keyboard",
        background: 3,
        musicVolume: 80,
        musicMuted: false,
        effectsVolume: 90,
        effectsMuted: false,
      };
      const settings = {
        ...body,
        createdAt: new Date(),
      };
      mockSaveOrUpdateUserSettings.mockResolvedValue(settings);

      const req: any = { body };
      const res = mockResponse();

      await saveSettings(req, res);

      expect(mockSaveOrUpdateUserSettings).toHaveBeenCalledWith(body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(settings);
    });

    it("responds 400 on error", async () => {
      mockSaveOrUpdateUserSettings.mockRejectedValue(
        new Error("Validation failed")
      );

      const req: any = { body: {} };
      const res = mockResponse();

      await saveSettings(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Validation failed" });
    });
  });

  describe("fetchLatestSettings", () => {
    it("responds 200 with latest settings if found", async () => {
      const latest = {
        name: "LatestUser",
        difficulty: 3,
        theme: 2,
        totalCards: 20,
        coverType: "uploaded",
        coverFileName: "custom.jpg",
        controlMethod: "mouse",
        background: 4,
        musicVolume: 70,
        musicMuted: false,
        effectsVolume: 60,
        effectsMuted: true,
        createdAt: new Date(),
      };
      mockGetLatestUserSettings.mockResolvedValue(latest);

      const req: any = {};
      const res = mockResponse();

      await fetchLatestSettings(req, res);

      expect(mockGetLatestUserSettings).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(latest);
    });

    it("responds 200 with null if not found", async () => {
      mockGetLatestUserSettings.mockResolvedValue(null);

      const req: any = {};
      const res = mockResponse();

      await fetchLatestSettings(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(null);
    });

    it("responds 400 on error", async () => {
      mockGetLatestUserSettings.mockRejectedValue(new Error("DB Error"));

      const req: any = {};
      const res = mockResponse();

      await fetchLatestSettings(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "DB Error" });
    });
  });

  describe("checkUserExists", () => {
    it("responds 200 with exists: true", async () => {
      mockUserExists.mockResolvedValue(true);

      const req: any = { params: { name: "UserA" } };
      const res = mockResponse();

      await checkUserExists(req, res);

      expect(mockUserExists).toHaveBeenCalledWith("UserA");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ exists: true });
    });

    it("responds 200 with exists: false", async () => {
      mockUserExists.mockResolvedValue(false);

      const req: any = { params: { name: "UnknownUser" } };
      const res = mockResponse();

      await checkUserExists(req, res);

      expect(mockUserExists).toHaveBeenCalledWith("UnknownUser");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ exists: false });
    });

    it("responds 400 on error", async () => {
      mockUserExists.mockRejectedValue(new Error("Some error"));

      const req: any = { params: { name: "UserA" } };
      const res = mockResponse();

      await checkUserExists(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Some error" });
    });
  });

  describe("fetchUserByName", () => {
    it("responds 200 with user settings if found", async () => {
      const userSettings = {
        name: "Jane",
        difficulty: 1,
        theme: 0,
        totalCards: 12,
        coverType: "default",
        controlMethod: "mouse",
        background: 1,
        musicVolume: 60,
        musicMuted: false,
        effectsVolume: 70,
        effectsMuted: false,
        createdAt: new Date(),
      };
      mockGetUserSettingsByName.mockResolvedValue(userSettings);

      const req: any = { params: { name: "Jane" } };
      const res = mockResponse();

      await fetchUserByName(req, res);

      expect(mockGetUserSettingsByName).toHaveBeenCalledWith("Jane");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(userSettings);
    });

    it("responds 200 with null if not found", async () => {
      mockGetUserSettingsByName.mockResolvedValue(null);

      const req: any = { params: { name: "NoUser" } };
      const res = mockResponse();

      await fetchUserByName(req, res);

      expect(mockGetUserSettingsByName).toHaveBeenCalledWith("NoUser");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(null);
    });

    it("responds 400 on error", async () => {
      mockGetUserSettingsByName.mockRejectedValue(new Error("Fetch error"));

      const req: any = { params: { name: "Jane" } };
      const res = mockResponse();

      await fetchUserByName(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Fetch error" });
    });
  });
});
