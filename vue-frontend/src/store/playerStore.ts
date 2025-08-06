// src/store/playerStore.ts
import { defineStore } from "pinia";
import {
  DEFAULT_COVER_IMAGE,
  DIFFICULTY_LEVELS,
  GAME_THEMES,
} from "../constants/assets";
import type { IUserSettings } from "../interfaces/IUserSettings";
import {
  getLatestUserSettings,
  getUserSettingsByName,
  saveUserSettings,
} from "../api/backend/userSettings";
import { useAudioStore } from "./audioStore";

export const usePlayerStore = defineStore("player", {
  state: () => ({
    // 🧑 Profile
    name: "",

    // ⚙️ Gameplay settings
    difficulty: 0 as keyof typeof DIFFICULTY_LEVELS,
    theme: 0 as keyof typeof GAME_THEMES,
    totalCards: 10,

    // 🖼️ Card cover
    coverType: "default" as "default" | "uploaded",
    coverFile: null as File | null,
    coverFileName: undefined as string | undefined,

    // 🎮 Control method
    controlMethod: "mouse" as "mouse" | "keyboard",

    // 🎵 Default background
    backgroundMusic: 0,

    // Indicates whether these states have already been uploaded
    isLoaded: false,
  }),

  actions: {
    setName(name: string) {
      this.name = name;
    },
    setDifficulty(level: keyof typeof DIFFICULTY_LEVELS) {
      this.difficulty = level;
    },
    setTheme(theme: keyof typeof GAME_THEMES) {
      this.theme = theme;
    },
    setTotalCards(n: number) {
      this.totalCards = n;
    },
    setCoverType(type: "default" | "uploaded") {
      this.coverType = type;
    },
    getDefaultCoverImage(): string {
      return DEFAULT_COVER_IMAGE;
    },
    setCoverFile(file: File | null) {
      this.coverFile = file;
    },
    setCoverFileName(filename: string | undefined) {
      this.coverFileName = filename;
    },
    setControlMethod(method: "mouse" | "keyboard") {
      this.controlMethod = method;
    },
    setBackgroundMusic(bg: number) {
      this.backgroundMusic = bg;
    },

    async loadInitialSettings() {
      try {
        const settings = await getLatestUserSettings();
        if (!settings) throw new Error("No settings found");
        this.loadFromSettings(settings);
        this.isLoaded = true;
      } catch {
        this.resetToDefaults();
        this.isLoaded = true;
      }
    },

    async loadUserSettingsByName(name: string) {
      const settings = await getUserSettingsByName(name);
      this.loadFromSettings(settings);
    },

    loadFromSettings(settings: IUserSettings) {
      this.name = settings.name;
      this.difficulty = settings.difficulty as keyof typeof DIFFICULTY_LEVELS;
      this.theme = settings.theme as keyof typeof GAME_THEMES;
      this.totalCards = settings.totalCards;
      this.coverType = settings.coverType;
      this.coverFileName = settings.coverFileName;
      this.controlMethod = settings.controlMethod;
      this.backgroundMusic = settings.background;

      const audio = useAudioStore();
      audio.applyAudioSettings({
        background: settings.background,
        musicVolume: settings.musicVolume,
        musicMuted: settings.musicMuted,
        effectsVolume: settings.effectsVolume,
        effectsMuted: settings.effectsMuted,
      });
    },

    resetToDefaults() {
      this.name = "";
      this.difficulty = 0;
      this.theme = 0;
      this.totalCards = 10;
      this.coverType = "default";
      this.coverFile = null;
      this.coverFileName = undefined;
      this.controlMethod = "mouse";
      this.backgroundMusic = 0;

      const audio = useAudioStore();
      audio.applyAudioSettings({
        background: 0,
        musicVolume: 50,
        musicMuted: false,
        effectsVolume: 70,
        effectsMuted: false,
      });
    },

    async saveToBackend() {
      if (!this.name || this.name.trim().length === 0)
        throw new Error("User name is required");

      const audio = useAudioStore();
      // Sync audioStore with playerStore settings before saving
      audio.applyAudioSettings({
        background: this.backgroundMusic,
        musicVolume: audio.musicVolume,
        musicMuted: audio.musicMuted,
        effectsVolume: audio.effectsVolume,
        effectsMuted: audio.effectsMuted,
      });

      const settings: IUserSettings = {
        name: this.name,
        difficulty: this.difficulty,
        theme: this.theme,
        totalCards: this.totalCards,
        coverType: this.coverType,
        coverFileName:
          this.coverType === "uploaded" ? this.coverFileName : undefined,
        controlMethod: this.controlMethod,
        background: this.backgroundMusic,
        musicVolume: audio.musicVolume,
        musicMuted: audio.musicMuted,
        effectsVolume: audio.effectsVolume,
        effectsMuted: audio.effectsMuted,
      };
      await saveUserSettings(settings);
    },
  },
});
