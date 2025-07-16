import { defineStore } from "pinia";
import {
  BASE_PATH_AUDIO_RESOURCES,
  BACKGROUND_MUSIC,
  OTHER_MUSICAL_BACKGROUNDS,
  GAME_EFFECTS,
  GAME_SCORE_MUSIC,
  DEFAULT_BACKGROUND,
} from "../constants/assets";

export type BackgroundMusicIndex = keyof typeof BACKGROUND_MUSIC;
type GameEffect = (typeof GAME_EFFECTS)[keyof typeof GAME_EFFECTS];
type GameScoreMusic = (typeof GAME_SCORE_MUSIC)[keyof typeof GAME_SCORE_MUSIC];

export const useAudioStore = defineStore("audio", {
  state: () => ({
    // 🎵 Background music
    musicTrack: DEFAULT_BACKGROUND as BackgroundMusicIndex,
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

      if (!this.musicMuted) {
        this.playMusic();
      }
    },

    setMusicMuted(muted: boolean) {
      this.musicMuted = muted;
      if (this.bgMusicInstance) this.bgMusicInstance.muted = muted;
    },

    setMusicVolume(volume: number) {
      this.musicVolume = volume;
      if (this.bgMusicInstance) 
        this.bgMusicInstance.volume = volume / 100;
    },

    setEffectsMuted(muted: boolean) {
      this.effectsMuted = muted;
    },

    setEffectsVolume(volume: number) {
      this.effectsVolume = volume;
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
    playGameMusicLoop() {
      this.stopAllAudio();

      const audio = this.playAudio(
        OTHER_MUSICAL_BACKGROUNDS.gameplay,
        "music",
        {
          loop: true,
          volume: this.effectsMuted ? 0 : this.effectsVolume / 100,
        }
      );

      this.gameMusicInstance = audio;
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

    // 🚫 Stop all audio
    stopAllAudio() {
      this.effectInstance?.pause();
      this.effectInstance = null;

      if (this.bgMusicInstance) {
        if (!this.bgMusicInstance.paused) {
          this.bgMusicInstance.pause();
          this._wasBackgroundPlaying = true;
        } else 
          this._wasBackgroundPlaying = false;
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
