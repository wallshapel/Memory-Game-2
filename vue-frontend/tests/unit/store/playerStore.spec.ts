// tests/unit/store/playerStore.spec.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { usePlayerStore } from "../../../src/store/playerStore";
import * as userSettingsApi from "../../../src/api/backend/userSettings";

// Mock external dependencies
vi.mock("../../../src/api/backend/userSettings", () => ({
  getLatestUserSettings: vi.fn(),
  getUserSettingsByName: vi.fn(),
  saveUserSettings: vi.fn(),
}));

vi.mock("../../../src/store/audioStore", () => ({
  useAudioStore: () => ({
    applyAudioSettings: vi.fn(),
  }),
}));

vi.mock("../../../src/constants/assets", () => ({
  DEFAULT_COVER_IMAGE: "mocked_default_cover.png",
  DIFFICULTY_LEVELS: { 0: "easy", 1: "normal", 2: "hard" },
  GAME_THEMES: { 0: "nature", 1: "space", 2: "ocean" },
}));

// <-- Here's the magic fix! -->
const { getLatestUserSettings, getUserSettingsByName, saveUserSettings } =
  userSettingsApi as unknown as {
    getLatestUserSettings: ReturnType<typeof vi.fn>;
    getUserSettingsByName: ReturnType<typeof vi.fn>;
    saveUserSettings: ReturnType<typeof vi.fn>;
  };

describe("playerStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("has the expected initial state", () => {
    const store = usePlayerStore();
    expect(store.name).toBe("");
    expect(store.difficulty).toBe(0);
    expect(store.theme).toBe(0);
    expect(store.totalCards).toBe(10);
    expect(store.coverType).toBe("default");
    expect(store.coverFile).toBeNull();
    expect(store.coverFileName).toBeUndefined();
    expect(store.controlMethod).toBe("mouse");
    expect(store.backgroundMusic).toBe(0);
    expect(store.isLoaded).toBe(false);
  });

  it("allows setting the name", () => {
    const store = usePlayerStore();
    store.setName("__test_user__");
    expect(store.name).toBe("__test_user__");
  });

  it("allows setting the difficulty", () => {
    const store = usePlayerStore();
    store.setDifficulty(2);
    expect(store.difficulty).toBe(2);
  });

  it("allows setting the theme", () => {
    const store = usePlayerStore();
    store.setTheme(1);
    expect(store.theme).toBe(1);
  });

  it("allows setting the total number of cards", () => {
    const store = usePlayerStore();
    store.setTotalCards(42);
    expect(store.totalCards).toBe(42);
  });

  it("allows setting the coverType", () => {
    const store = usePlayerStore();
    store.setCoverType("uploaded");
    expect(store.coverType).toBe("uploaded");
  });

  it("allows setting the coverFile", () => {
    const store = usePlayerStore();
    const mockFile = new File(["dummy content"], "test.png", {
      type: "image/png",
    });
    store.setCoverFile(mockFile);
    expect(store.coverFile).toBe(mockFile);
  });

  it("allows setting the coverFileName", () => {
    const store = usePlayerStore();
    store.setCoverFileName("avatar.jpg");
    expect(store.coverFileName).toBe("avatar.jpg");
  });

  it("allows setting the controlMethod", () => {
    const store = usePlayerStore();
    store.setControlMethod("keyboard");
    expect(store.controlMethod).toBe("keyboard");
  });

  it("allows setting the backgroundMusic", () => {
    const store = usePlayerStore();
    store.setBackgroundMusic(2);
    expect(store.backgroundMusic).toBe(2);
  });

  it("getDefaultCoverImage returns the default cover image", () => {
    const store = usePlayerStore();
    expect(store.getDefaultCoverImage()).toBe("mocked_default_cover.png");
  });

  it("resetToDefaults resets state to initial values", async () => {
    const store = usePlayerStore();
    const mockFile = new File(["dummy content"], "test.png", {
      type: "image/png",
    });
    store.setName("__test_user__");
    store.setDifficulty(2);
    store.setTheme(2);
    store.setTotalCards(99);
    store.setCoverType("uploaded");
    store.setCoverFile(mockFile);
    store.setCoverFileName("pic.jpg");
    store.setControlMethod("keyboard");
    store.setBackgroundMusic(5);

    await store.resetToDefaults();

    expect(store.name).toBe("");
    expect(store.difficulty).toBe(0);
    expect(store.theme).toBe(0);
    expect(store.totalCards).toBe(10);
    expect(store.coverType).toBe("default");
    expect(store.coverFile).toBeNull();
    expect(store.coverFileName).toBeUndefined();
    expect(store.controlMethod).toBe("mouse");
    expect(store.backgroundMusic).toBe(0);
  });

  it("loadFromSettings sets state from a given settings object", async () => {
    const store = usePlayerStore();
    const mockSettings = {
      name: "__test_user__",
      difficulty: 2,
      theme: 1,
      totalCards: 20,
      coverType: "uploaded" as const,
      coverFileName: "pic.png",
      controlMethod: "keyboard" as const,
      background: 3,
      musicVolume: 77,
      musicMuted: true,
      effectsVolume: 88,
      effectsMuted: false,
    };
    await store.loadFromSettings(mockSettings);

    expect(store.name).toBe("__test_user__");
    expect(store.difficulty).toBe(2);
    expect(store.theme).toBe(1);
    expect(store.totalCards).toBe(20);
    expect(store.coverType).toBe("uploaded");
    expect(store.coverFileName).toBe("pic.png");
    expect(store.controlMethod).toBe("keyboard");
    expect(store.backgroundMusic).toBe(3);
  });

  it("loadInitialSettings loads settings if available", async () => {
    const store = usePlayerStore();
    getLatestUserSettings.mockResolvedValueOnce({
      name: "__test_user__",
      difficulty: 1,
      theme: 0,
      totalCards: 12,
      coverType: "default" as const,
      coverFileName: undefined,
      controlMethod: "mouse" as const,
      background: 1,
      musicVolume: 55,
      musicMuted: false,
      effectsVolume: 66,
      effectsMuted: false,
    });
    await store.loadInitialSettings();
    expect(store.isLoaded).toBe(true);
    expect(store.name).toBe("__test_user__");
    expect(store.difficulty).toBe(1);
    expect(store.theme).toBe(0);
    expect(store.totalCards).toBe(12);
    expect(store.coverType).toBe("default");
    expect(store.coverFileName).toBeUndefined();
    expect(store.controlMethod).toBe("mouse");
    expect(store.backgroundMusic).toBe(1);
  });

  it("loadInitialSettings resets to defaults if no settings", async () => {
    const store = usePlayerStore();
    getLatestUserSettings.mockResolvedValueOnce(null);
    await store.loadInitialSettings();
    expect(store.isLoaded).toBe(true);
    expect(store.name).toBe("");
    expect(store.difficulty).toBe(0);
  });

  it("loadUserSettingsByName loads settings by name", async () => {
    const store = usePlayerStore();
    getUserSettingsByName.mockResolvedValueOnce({
      name: "__test_user__",
      difficulty: 2,
      theme: 2,
      totalCards: 15,
      coverType: "uploaded" as const,
      coverFileName: "pic2.png",
      controlMethod: "keyboard" as const,
      background: 2,
      musicVolume: 40,
      musicMuted: true,
      effectsVolume: 50,
      effectsMuted: false,
    });
    await store.loadUserSettingsByName("__test_user__");
    expect(store.name).toBe("__test_user__");
    expect(store.difficulty).toBe(2);
    expect(store.theme).toBe(2);
    expect(store.totalCards).toBe(15);
    expect(store.coverType).toBe("uploaded");
    expect(store.coverFileName).toBe("pic2.png");
    expect(store.controlMethod).toBe("keyboard");
    expect(store.backgroundMusic).toBe(2);
  });

  it("saveToBackend throws error if name is missing", async () => {
    const store = usePlayerStore();
    store.setName("");
    await expect(store.saveToBackend()).rejects.toThrowError(
      "User name is required"
    );
  });

  it("saveToBackend calls saveUserSettings if name is set", async () => {
    const store = usePlayerStore();
    store.setName("__test_user__");
    await store.saveToBackend();
    expect(saveUserSettings).toHaveBeenCalled();
    const calledWith = saveUserSettings.mock.calls[0][0];
    expect(calledWith.name).toBe("__test_user__");
  });
});
