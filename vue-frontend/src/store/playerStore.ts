import { defineStore } from "pinia";
import {
  DEFAULT_COVER_IMAGE,
  DIFFICULTY_LEVELS,
  GAME_THEMES,
} from "../constants/assets";
import type { IUserSettings } from "../interfaces/IUserSettings";
import {
  getLatestUserSettings,
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
    // 🧑 Profile
    setName(name: string) {
      this.name = name;
    },
    // 🪜 Levels
    setDifficulty(level: keyof typeof DIFFICULTY_LEVELS) {
      this.difficulty = level;
    },
    // 🎯 Themes
    setTheme(theme: keyof typeof GAME_THEMES) {
      this.theme = theme;
    },
    // 💯 Total Cards
    setTotalCards(n: number) {
      this.totalCards = n;
    },
    // 📤 Cover Type
    setCoverType(type: "default" | "uploaded") {
      this.coverType = type;
    },
    // 🖼️ Card cover
    getDefaultCoverImage(): string {
      return DEFAULT_COVER_IMAGE;
    },
    // 📄 Cover File
    setCoverFile(file: File | null) {
      this.coverFile = file;
    },
    // 🖱️⌨️ Control Method
    setControlMethod(method: "mouse" | "keyboard") {
      this.controlMethod = method;
    },
    // 🎵 Set default background
    setBackgroundMusic(bg: number) {
      this.backgroundMusic = bg;
    },

    // Backend
    async loadInitialSettings() {
      try {
        const settings = await getLatestUserSettings();
        if (!settings) throw new Error("No settings found");
        this.name = settings.name;
        this.difficulty = settings.difficulty as keyof typeof DIFFICULTY_LEVELS;
        this.theme = settings.theme as keyof typeof GAME_THEMES;
        this.totalCards = settings.totalCards;
        this.coverType = settings.coverType;
        this.coverFileName = settings.coverFileName;
        this.controlMethod = settings.controlMethod;
        this.backgroundMusic = settings.background;
        const audio = useAudioStore();
        audio.musicTrack = settings.background as typeof audio.musicTrack;
        audio.musicVolume = settings.musicVolume ?? 50;
        audio.musicMuted = settings.musicMuted ?? false;
        audio.effectsVolume = settings.effectsVolume ?? 70;
        audio.effectsMuted = settings.effectsMuted ?? false;
        this.isLoaded = true;
      } catch (e) {
        this.name = "";
        this.difficulty = 0 as keyof typeof DIFFICULTY_LEVELS;
        this.theme = 0 as keyof typeof GAME_THEMES;
        this.totalCards = 10;
        this.coverType = "default";
        this.coverFile = null;
        this.coverFileName = undefined;
        this.controlMethod = "mouse";
        this.backgroundMusic = 0;
        const audio = useAudioStore();
        audio.musicTrack = 0;
        audio.musicVolume = 50;
        audio.musicMuted = false;
        audio.effectsVolume = 70;
        audio.effectsMuted = false;
        this.isLoaded = true;
        console.warn(
          "Initial settings could not be loaded, defaults restored.",
          e
        );
      }
    },
    
    async saveToBackend() {
      if (!this.name || this.name.trim().length === 0)
        throw new Error("User name is required");

      const audio = useAudioStore();

      const settings: IUserSettings = {
        name: this.name,
        difficulty: this.difficulty,
        theme: this.theme,
        totalCards: this.totalCards,
        coverType: this.coverType,
        coverFileName:
          this.coverType === "uploaded"
            ? (this as any).coverFileName
            : undefined,
        controlMethod: this.controlMethod,
        background: this.backgroundMusic,
        musicVolume: audio.musicVolume,
        musicMuted: audio.musicMuted,
        effectsVolume: audio.effectsVolume,
        effectsMuted: audio.effectsMuted,
      };
      await saveUserSettings(settings);
    },

    setCoverFileName(filename: string | undefined) {
      this.coverFileName = filename;
    },
  },
});
