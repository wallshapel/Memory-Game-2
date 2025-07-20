import { defineStore } from "pinia";
import {
  DEFAULT_COVER_IMAGE,
  DIFFICULTY_LEVELS,
  GAME_THEMES,
} from "../constants/assets";

export const usePlayerStore = defineStore("player", {
  state: () => ({
    // 🧑 Profile
    name: "legato",

    // ⚙️ Gameplay settings
    difficulty: 0 as keyof typeof DIFFICULTY_LEVELS,
    theme: 0 as keyof typeof GAME_THEMES,
    totalCards: 10,

    // 🖼️ Card cover
    coverType: "default" as "default" | "uploaded",
    coverFile: null as File | null,

    // 🎮 Control method
    controlMethod: "mouse" as "mouse" | "keyboard",

    // 🎵 Default background
    backgroundMusic: 1,
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
  },
});
