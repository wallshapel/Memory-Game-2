import { defineStore } from "pinia";
import {
  DEFAULT_COVER_IMAGE,
  BASE_PATH_AUDIO_RESOURCES,
  DIFFICULTY_LEVELS,
  GAME_THEMES,
  SOUND_EFFECTS_GAME_RESULT,
  BACKGROUND_MUSIC,
  SOUND_EFFECTS_HIT_FAILS,
  DEFAULT_BACKGROUND,
} from "../constants/assets";

type BackgroundMusicKey = keyof typeof BACKGROUND_MUSIC;

export const usePlayerStore = defineStore("player", {
  state: () => ({
    // 🧑 Profile
    name: "legato",

    // ⚙️ Gameplay settings
    difficulty: DIFFICULTY_LEVELS.EASY as keyof typeof DIFFICULTY_LEVELS,
    theme: GAME_THEMES.ANIMALS as keyof typeof GAME_THEMES,
    totalCards: 10,

    // 🖼️ Card cover
    coverType: "default" as "default" | "uploaded",
    coverFile: null as File | null,

    // 🎮 Control method
    controlMethod: "mouse" as "mouse" | "keyboard",

    // 🎵 Background music
    musicTrack: DEFAULT_BACKGROUND.composer as BackgroundMusicKey,

    musicMuted: false,
    musicVolume: 50,
    bgMusicInstance: null as HTMLAudioElement | null,

    // 🔊 Sound effects
    effectsMuted: false,
    effectsVolume: 70,
    effectInstance: null as HTMLAudioElement | null,

    // 📡 Internal tracking
    _wasBackgroundPlaying: false,
  }),

  actions: {
    // 📦 Setters
    getDefaultCoverImage(): string {
      return DEFAULT_COVER_IMAGE;
    },

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

    setCoverFile(file: File | null) {
      this.coverFile = file;
    },

    setControlMethod(method: "mouse" | "keyboard") {
      this.controlMethod = method;
    },

    setMusicTrack(track: BackgroundMusicKey) {
      if (this.bgMusicInstance) {
        this.bgMusicInstance.pause();
        this.bgMusicInstance = null;
      }

      this.musicTrack = track;

      if (!this.musicMuted) this.playMusic();
    },

    setMusicMuted(muted: boolean) {
      this.musicMuted = muted;

      if (this.bgMusicInstance) this.bgMusicInstance.muted = muted;
    },

    setMusicVolume(volume: number) {
      this.musicVolume = volume;
      if (this.bgMusicInstance) this.bgMusicInstance.volume = volume / 100;
    },

    setEffectsMuted(muted: boolean) {
      this.effectsMuted = muted;
    },

    setEffectsVolume(volume: number) {
      this.effectsVolume = volume;
    },

    // 🎵 Background music playback
    playMusic() {
      if (this.musicMuted) return;

      if (!this.bgMusicInstance) {
        const file = BACKGROUND_MUSIC[this.musicTrack].file;
        const src = `${BASE_PATH_AUDIO_RESOURCES.MUSIC_PATH}${file}.mp3`;

        const audio = new Audio();
        audio.loop = true;
        audio.volume = this.musicVolume / 100;
        audio.src = src;

        this.bgMusicInstance = audio;
      }

      this.bgMusicInstance.volume = this.musicVolume / 100;
      this.bgMusicInstance.muted = this.musicMuted;

      this.bgMusicInstance.play().catch(() => {});
    },

    stopMusic() {
      if (this.bgMusicInstance) {
        this.bgMusicInstance.pause();
        this.bgMusicInstance = null;
      }
    },

    resumeMusicIfWasPlaying() {
      if (this._wasBackgroundPlaying) {
        this._wasBackgroundPlaying = false;
        this.playMusic();
      }
    },

    // 🔊 Sound effects
    playEffect(
      name:
        | typeof SOUND_EFFECTS_HIT_FAILS.EFFECT_SELECT
        | typeof SOUND_EFFECTS_HIT_FAILS.EFFECT_SUCCESS
        | typeof SOUND_EFFECTS_HIT_FAILS.EFFECT_ERROR
        | typeof SOUND_EFFECTS_HIT_FAILS.EFFECT_OVER
        | typeof SOUND_EFFECTS_GAME_RESULT.EFFECT_VICTORY
        | typeof SOUND_EFFECTS_GAME_RESULT.EFFECT_GAME_OVER
    ) {
      if (this.effectsMuted) return;

      const isStrong =
        name === SOUND_EFFECTS_GAME_RESULT.EFFECT_VICTORY ||
        name === SOUND_EFFECTS_GAME_RESULT.EFFECT_GAME_OVER;

      if (isStrong && this.bgMusicInstance) {
        this.bgMusicInstance.pause();
        this.bgMusicInstance = null;
        this._wasBackgroundPlaying = true;
      }

      const audio = new Audio(
        `${BASE_PATH_AUDIO_RESOURCES.EFFECTS_PATH}${name}.mp3`
      );
      audio.volume = this.effectsVolume / 100;

      if (isStrong) {
        this.effectInstance?.pause();
        this.effectInstance = audio;
      }

      audio.play().then().catch();
    },

    stopAllAudio() {
      if (this.effectInstance) {
        this.effectInstance.pause();
        this.effectInstance = null;
      }

      if (this.bgMusicInstance) {
        if (!this.bgMusicInstance.paused) {
          this.bgMusicInstance.pause();
          this._wasBackgroundPlaying = true;
        } else 
          this._wasBackgroundPlaying = false;        
      }
    },

    getMusicFileFromKey(key: BackgroundMusicKey): string {
      return BACKGROUND_MUSIC[key].file;
    },
  },
});
