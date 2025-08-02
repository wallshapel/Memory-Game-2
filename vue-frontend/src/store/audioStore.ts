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
import type { IAudioSettings } from "../interfaces/IAudioSettings";

export type BackgroundMusicIndex = keyof typeof BACKGROUND_MUSIC;
type GameEffect = (typeof GAME_EFFECTS)[keyof typeof GAME_EFFECTS];
type GameScoreMusic = (typeof GAME_SCORE_MUSIC)[keyof typeof GAME_SCORE_MUSIC];

/**
 * Pinia store for handling all audio logic, including background music
 * and sound effects. Centralizes audio state for the entire application.
 */
export const useAudioStore = defineStore("audio", {
  state: () => ({
    // 🎵 Background music track index (see BACKGROUND_MUSIC)
    musicTrack: usePlayerStore().backgroundMusic as BackgroundMusicIndex,
    // Is background music muted?
    musicMuted: false,
    // Background music volume (0-100)
    musicVolume: 50,
    // Current background music audio instance
    bgMusicInstance: null as HTMLAudioElement | null,

    // 🔊 Sound effects
    effectsMuted: false,
    // Effects volume (0-100)
    effectsVolume: 70,
    // Current effect audio instance
    effectInstance: null as HTMLAudioElement | null,

    // 📡 Internal flag for remembering background play state
    _wasBackgroundPlaying: false,
  }),

  actions: {
    /**
     * Sets the current background music track and starts playing it if not muted.
     * Stops any previous music first.
     * @param track - Index of the background music to play.
     */
    setMusicTrack(track: BackgroundMusicIndex) {
      if (this.bgMusicInstance) {
        this.bgMusicInstance.pause();
        this.bgMusicInstance = null;
      }
      this.musicTrack = track;

      if (!this.musicMuted) this.playMusic();
    },

    /**
     * Mutes or unmutes background music. Pauses or resumes the current audio instance accordingly.
     * @param muted - True to mute, false to unmute.
     */
    setMusicMuted(muted: boolean) {
      this.musicMuted = muted;

      if (this.bgMusicInstance) {
        this.bgMusicInstance.muted = muted;
        // If music is muted, pause immediately; if unmuted, play immediately
        if (muted) this.bgMusicInstance.pause();
        else this.bgMusicInstance.play().catch(() => {});
      }
    },

    /**
     * Sets the background music volume. Value is clamped between 0 and 100.
     * @param volume - The new volume (0-100).
     */
    setMusicVolume(volume: number) {
      this.musicVolume = Math.max(0, Math.min(100, volume));
      if (this.bgMusicInstance) this.bgMusicInstance.volume = volume / 100;
    },

    /**
     * Mutes or unmutes all sound effects.
     * @param muted - True to mute, false to unmute.
     */
    setEffectsMuted(muted: boolean) {
      this.effectsMuted = muted;
    },

    /**
     * Sets the sound effects volume (0-100).
     * @param volume - The new effects volume.
     */
    setEffectsVolume(volume: number) {
      this.effectsVolume = volume;
    },

    /**
     * Applies a full set of audio settings at once (music/effects volume & mute state, music track).
     * @param settings - Audio settings object.
     */
    applyAudioSettings(settings: IAudioSettings) {
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

    /**
     * Creates and plays an audio file. Can be used for music or effects.
     * Handles .mp3 extension automatically.
     * @param fileName - File name, with or without .mp3 extension.
     * @param type - "music" or "effect".
     * @param options - Playback options (loop, volume).
     * @returns The created HTMLAudioElement.
     */
    playAudio(
      fileName: string,
      type: "music" | "effect",
      { loop = false, volume = 1 }: { loop?: boolean; volume?: number } = {}
    ): HTMLAudioElement {
      const basePath =
        type === "music"
          ? BASE_PATH_AUDIO_RESOURCES.MUSIC_PATH
          : BASE_PATH_AUDIO_RESOURCES.EFFECTS_PATH;
      const finalFile = fileName.endsWith(".mp3")
        ? fileName
        : `${fileName}.mp3`;
      const path = `${basePath}${finalFile}`;

      const audio = new Audio(path);

      audio.loop = loop;
      audio.volume = volume;
      audio.muted = type === "music" ? this.musicMuted : this.effectsMuted;

      audio.play().catch(() => {});

      return audio;
    },

    /**
     * Stops any currently playing background music and starts a new one.
     * Typically used for immediate transitions (e.g., config screen).
     * @param file - File name, with or without .mp3 extension.
     * @param volume - Optional volume (0-100).
     * @param muted - Optional mute state.
     */
    playAndSetBgMusic(file: string, volume?: number, muted?: boolean) {
      this.bgMusicInstance?.pause();
      const audio = this.playAudio(file, "music", {
        loop: true,
        volume:
          typeof volume === "number" ? volume / 100 : this.musicVolume / 100,
      });
      audio.muted = typeof muted === "boolean" ? muted : this.musicMuted;
      this.bgMusicInstance = audio;
    },

    /**
     * Plays the background music currently set in `musicTrack`.
     * If muted, does nothing.
     */
    playMusic() {
      if (this.musicMuted) return;

      const { file } = BACKGROUND_MUSIC[this.musicTrack];

      const audio = this.playAudio(file, "music", {
        loop: true,
        volume: this.musicVolume / 100,
      });

      this.bgMusicInstance = audio;
    },

    /**
     * Stops and cleans up the current background music instance.
     */
    stopMusic() {
      if (this.bgMusicInstance) {
        this.bgMusicInstance.pause();
        this.bgMusicInstance.src = "";
        this.bgMusicInstance = null;
      }
    },

    /**
     * Resumes music if it was playing before the last interruption (e.g., after sound effect).
     */
    resumeMusicIfWasPlaying() {
      if (this._wasBackgroundPlaying) {
        this._wasBackgroundPlaying = false;
        this.playMusic();
      }
    },

    /**
     * Plays the looping menu music, unless already playing or muted.
     */
    playMenuMusicLoop() {
      if (this.musicMuted || this.bgMusicInstance) return;

      const file = OTHER_MUSICAL_BACKGROUNDS.settings;
      const audio = this.playAudio(file, "music", {
        loop: true,
        volume: this.musicVolume / 100,
      });

      this.bgMusicInstance = audio;
    },

    /**
     * Stops all audio (background and effects).
     * Remembers whether background was playing for possible resume.
     */
    stopAllAudio() {
      this.effectInstance?.pause();
      this.effectInstance = null;

      if (this.bgMusicInstance) {
        if (!this.bgMusicInstance.paused) {
          this.bgMusicInstance.pause();
          this._wasBackgroundPlaying = true;
        } else this._wasBackgroundPlaying = false;
      }
    },

    /**
     * Plays a sound effect or special game music cue (victory/game over).
     * Strong cues (like victory) also pause the background music.
     * @param name - Effect or cue name (string key).
     */
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

    /**
     * Returns the filename (without extension) for the given background music index.
     * Used for referencing music assets.
     * @param key - Index of the background music.
     * @returns File name string.
     */
    getMusicFileFromKey(key: BackgroundMusicIndex): string {
      return BACKGROUND_MUSIC[key].file;
    },

    /**
     * Plays background music for the current view.
     * If "user", plays the track chosen in settings.
     * If "fixed", plays the given file.
     */
    playBackgroundForView(
      opts:
        | { type: "user" }
        | { type: "fixed"; file: string; loop?: boolean; volume?: number }
    ) {
      this.stopMusic();
      if (opts.type === "user") {
        const { file } = BACKGROUND_MUSIC[this.musicTrack];
        const audio = this.playAudio(file, "music", {
          loop: true,
          volume: this.musicVolume / 100,
        });
        this.bgMusicInstance = audio;
      } else if (opts.type === "fixed") {
        const audio = this.playAudio(opts.file, "music", {
          loop: opts.loop ?? true,
          volume:
            typeof opts.volume === "number"
              ? opts.volume / 100
              : this.musicVolume / 100,
        });
        this.bgMusicInstance = audio;
      }
    },
  },
});
