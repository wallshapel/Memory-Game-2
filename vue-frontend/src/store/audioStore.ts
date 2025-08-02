// src/store/audioStore.ts
import { defineStore } from "pinia";
import {
  BASE_PATH_AUDIO_RESOURCES,
  BACKGROUND_MUSIC,
  OTHER_MUSICAL_BACKGROUNDS,
  GAME_EFFECTS,
  GAME_SCORE_MUSIC,
} from "../constants/assets";
import { usePlayerStore } from "./playerStore";

export type BackgroundMusicIndex = keyof typeof BACKGROUND_MUSIC;
type GameEffect = (typeof GAME_EFFECTS)[keyof typeof GAME_EFFECTS];
type GameScoreMusic = (typeof GAME_SCORE_MUSIC)[keyof typeof GAME_SCORE_MUSIC];

export const useAudioStore = defineStore("audio", {
  state: () => ({
    // 🎵 Background music
    musicTrack: usePlayerStore().backgroundMusic as BackgroundMusicIndex,
    musicMuted: false,
    musicVolume: 50,
    bgMusicInstance: null as HTMLAudioElement | null,

    // 🔊 Sound effects
    effectsMuted: false,
    effectsVolume: 70,
    effectInstance: null as HTMLAudioElement | null,
    gameMusicInstance: null as HTMLAudioElement | null,

    // 📡 Internal tracking
    _wasBackgroundPlaying: false,
  }),

  actions: {
    // 📻 Music Controls
    setMusicTrack(track: BackgroundMusicIndex) {
      if (this.bgMusicInstance) {
        this.bgMusicInstance.pause();
        this.bgMusicInstance = null;
      }
      this.musicTrack = track;

      if (!this.musicMuted) this.playMusic();
    },

    setMusicMuted(muted: boolean) {
      this.musicMuted = muted;

      if (this.bgMusicInstance) {
        this.bgMusicInstance.muted = muted;
        // If music is muted, pause immediately; if unmuted, play immediately
        if (muted) this.bgMusicInstance.pause();
        else this.bgMusicInstance.play().catch(() => {});
      }
      // If in gameplay, also apply to gameMusicInstance
      if (this.gameMusicInstance) {
        this.gameMusicInstance.muted = muted;
        if (muted) this.gameMusicInstance.pause();
        else this.gameMusicInstance.play().catch(() => {});
      }
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

    applyAudioSettings(settings: {
      musicVolume?: number;
      musicMuted?: boolean;
      effectsVolume?: number;
      effectsMuted?: boolean;
      background?: number;
    }) {
      if (typeof settings.background === "number")
        this.musicTrack = settings.background as BackgroundMusicIndex;
      if (typeof settings.musicVolume === "number") {
        this.musicVolume = settings.musicVolume;
        if (this.bgMusicInstance)
          this.bgMusicInstance.volume = this.musicVolume / 100;
      }
      if (typeof settings.musicMuted === "boolean") {
        this.musicMuted = settings.musicMuted;
        if (this.bgMusicInstance) this.bgMusicInstance.muted = this.musicMuted;
      }
      if (typeof settings.effectsVolume === "number")
        this.effectsVolume = settings.effectsVolume;
      if (typeof settings.effectsMuted === "boolean")
        this.effectsMuted = settings.effectsMuted;
    },

    // 🔁 Music & Effects: Core Player
    playAudio(
      fileName: string,
      type: "music" | "effect",
      { loop = false, volume = 1 }: { loop?: boolean; volume?: number } = {}
    ): HTMLAudioElement {
      const basePath =
        type === "music"
          ? BASE_PATH_AUDIO_RESOURCES.MUSIC_PATH
          : BASE_PATH_AUDIO_RESOURCES.EFFECTS_PATH;

      const path = `${basePath}${fileName}.mp3`;
      const audio = new Audio(path);

      audio.loop = loop;
      audio.volume = volume;
      audio.muted = type === "music" ? this.musicMuted : this.effectsMuted;

      audio.play().catch((err) => {
        console.warn(`[⚠️ playAudio error] ${err.message}`);
      });

      return audio;
    },

    // ▶️
    playMusic() {
      if (this.musicMuted) return;

      const { file } = BACKGROUND_MUSIC[this.musicTrack];

      const audio = this.playAudio(file, "music", {
        loop: true,
        volume: this.musicVolume / 100,
      });

      this.bgMusicInstance = audio;
    },

    // 🚫
    stopMusic() {
      if (this.bgMusicInstance) {
        this.bgMusicInstance.pause();
        this.bgMusicInstance = null;
      }
    },

    // ⏯️ Resume
    resumeMusicIfWasPlaying() {
      if (this._wasBackgroundPlaying) {
        this._wasBackgroundPlaying = false;
        this.playMusic();
      }
    },

    // 🎮 Game Music
    playGameMusicLoop(isCountdownMode = false) {
      this.stopAllAudio();

      const file = isCountdownMode
        ? OTHER_MUSICAL_BACKGROUNDS.timetrial
        : OTHER_MUSICAL_BACKGROUNDS.gameplay;

      const audio = this.playAudio(file, "music", {
        loop: true,
        volume: this.musicVolume / 100,
      });

      this.bgMusicInstance = audio;
    },

    // ⚙️ Menu Music
    playMenuMusicLoop() {
      if (this.musicMuted || this.bgMusicInstance) return;

      const file = OTHER_MUSICAL_BACKGROUNDS.settings;
      const audio = this.playAudio(file, "music", {
        loop: true,
        volume: this.musicVolume / 100,
      });

      this.bgMusicInstance = audio;
    },

    // 🏆 Records
    playRecordsMusicLoop() {
      this.stopAllAudio();

      const file = OTHER_MUSICAL_BACKGROUNDS.records;
      const audio = this.playAudio(file, "music", {
        loop: true,
        volume: this.musicVolume / 100,
      });

      this.bgMusicInstance = audio;
    },

    // 🚫 Stop all audio
    stopAllAudio() {
      this.effectInstance?.pause();
      this.effectInstance = null;

      if (this.bgMusicInstance) {
        if (!this.bgMusicInstance.paused) {
          this.bgMusicInstance.pause();
          this._wasBackgroundPlaying = true;
        } else this._wasBackgroundPlaying = false;
      }

      this.gameMusicInstance?.pause();
      this.gameMusicInstance = null;
    },

    // 🔊 play effect
    playEffect(name: GameEffect | GameScoreMusic) {
      if (this.effectsMuted) return;

      const isStrong =
        name === GAME_SCORE_MUSIC.MUSIC_VICTORY ||
        name === GAME_SCORE_MUSIC.MUSIC_GAME_OVER;

      if (isStrong && this.bgMusicInstance) {
        this.bgMusicInstance.pause();
        this.bgMusicInstance = null;
        this._wasBackgroundPlaying = true;
      }

      const audio = this.playAudio(name, isStrong ? "music" : "effect", {
        volume: this.effectsVolume / 100,
      });

      if (isStrong) {
        this.effectInstance?.pause();
        this.effectInstance = audio;
      }
    },

    getMusicFileFromKey(key: BackgroundMusicIndex): string {
      return BACKGROUND_MUSIC[key].file;
    },
  },
});
