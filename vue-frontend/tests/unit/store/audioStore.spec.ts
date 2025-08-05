// tests/unit/store/audioStore.spec.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useAudioStore } from "../../../src/store/audioStore";
import type { IAudioSettings } from "../../../src/interfaces/IAudioSettings";

// Mock external dependencies
vi.mock("../../../src/constants/assets", () => ({
  BASE_PATH_AUDIO_RESOURCES: {
    MUSIC_PATH: "/mock/music/",
    EFFECTS_PATH: "/mock/effects/",
  },
  BACKGROUND_MUSIC: {
    0: { file: "trio_sonata_no_1", label: "Triosonate Nr. 1 Es-Dur BWV 525" },
    1: { file: "moonlight_sonata", label: "Sonata Op. 27 No. 2" },
    2: { file: "ballade_no_2", label: "Ballade No. 2 en Fa majeur Op. 38" },
    3: { file: "god_blessing_in_solitude", label: "La bénédiction de Dieu..." },
  },
  OTHER_MUSICAL_BACKGROUNDS: {
    gameplay: "feuxfollets",
    timetrial: "la_campanella",
    settings: "liebestraum",
    records: "aquarium",
  },
  GAME_EFFECTS: {
    EFFECT_SELECT: "select",
    EFFECT_SUCCESS: "success",
    EFFECT_ERROR: "error",
    EFFECT_OVER: "over",
  },
  GAME_SCORE_MUSIC: {
    MUSIC_VICTORY: "entertainer",
    MUSIC_GAME_OVER: "funeral",
  },
}));

vi.mock("../../../src/store/playerStore", () => ({
  usePlayerStore: () => ({
    backgroundMusic: 0,
  }),
}));

// Mock for Audio API
const playMock = vi.fn().mockResolvedValue(undefined);
const pauseMock = vi.fn();
class MockAudio {
  src: string;
  loop = false;
  volume = 1;
  muted = false;
  paused = false;
  constructor(src: string) {
    this.src = src;
  }
  play = playMock;
  pause = pauseMock;
}
globalThis.Audio = MockAudio as any;

describe("audioStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("has the expected initial state", () => {
    const store = useAudioStore();
    expect(store.musicTrack).toBe(0);
    expect(store.musicMuted).toBe(false);
    expect(store.musicVolume).toBe(50);
    expect(store.bgMusicInstance).toBeNull();
    expect(store.effectsMuted).toBe(false);
    expect(store.effectsVolume).toBe(70);
    expect(store.effectInstance).toBeNull();
    expect(store._wasBackgroundPlaying).toBe(false);
  });

  it("sets music track and plays if not muted", () => {
    const store = useAudioStore();
    store.musicMuted = false;
    store.setMusicTrack(1);
    expect(store.musicTrack).toBe(1);
    expect(playMock).toHaveBeenCalled();
  });

  it("stops previous music instance when setting new track", () => {
    const store = useAudioStore();
    const fakeAudio = new MockAudio("test.mp3");
    store.bgMusicInstance = fakeAudio as any;
    store.setMusicTrack(0);
    expect(pauseMock).toHaveBeenCalled();
    expect(store.bgMusicInstance).not.toBe(fakeAudio);
  });

  it("sets music muted state and updates instance", () => {
    const store = useAudioStore();
    const fakeAudio = new MockAudio("test.mp3");
    store.bgMusicInstance = fakeAudio as any;
    store.setMusicMuted(true);
    expect(store.musicMuted).toBe(true);
    expect(fakeAudio.muted).toBe(true);
    expect(pauseMock).toHaveBeenCalled();
    store.setMusicMuted(false);
    expect(fakeAudio.muted).toBe(false);
    expect(playMock).toHaveBeenCalled();
  });

  it("sets music volume and updates instance", () => {
    const store = useAudioStore();
    const fakeAudio = new MockAudio("test.mp3");
    store.bgMusicInstance = fakeAudio as any;
    store.setMusicVolume(90);
    expect(store.musicVolume).toBe(90);
    expect(fakeAudio.volume).toBeCloseTo(0.9);
  });

  it("clamps music volume between 0 and 100", () => {
    const store = useAudioStore();
    store.setMusicVolume(-10);
    expect(store.musicVolume).toBe(0);
    store.setMusicVolume(101);
    expect(store.musicVolume).toBe(100);
  });

  it("sets effects muted", () => {
    const store = useAudioStore();
    store.setEffectsMuted(true);
    expect(store.effectsMuted).toBe(true);
    store.setEffectsMuted(false);
    expect(store.effectsMuted).toBe(false);
  });

  it("sets effects volume", () => {
    const store = useAudioStore();
    store.setEffectsVolume(25);
    expect(store.effectsVolume).toBe(25);
  });

  it("applies audio settings object", () => {
    const store = useAudioStore();
    const settings: IAudioSettings = {
      background: 1,
      musicVolume: 90,
      musicMuted: true,
      effectsVolume: 33,
      effectsMuted: true,
    };
    const fakeAudio = new MockAudio("moonlight_sonata");
    store.bgMusicInstance = fakeAudio as any;
    store.applyAudioSettings(settings);
    expect(store.musicTrack).toBe(1);
    expect(store.musicVolume).toBe(90);
    expect(fakeAudio.volume).toBeCloseTo(0.9);
    expect(store.musicMuted).toBe(true);
    expect(fakeAudio.muted).toBe(true);
    expect(store.effectsVolume).toBe(33);
    expect(store.effectsMuted).toBe(true);
  });

  it("playAudio constructs the correct path and audio options", () => {
    const store = useAudioStore();
    const musicAudio = store.playAudio("trio_sonata_no_1", "music", {
      loop: true,
      volume: 0.8,
    });
    expect(musicAudio.src).toBe("/mock/music/trio_sonata_no_1.mp3");
    expect(musicAudio.loop).toBe(true);
    expect(musicAudio.volume).toBe(0.8);
    expect(musicAudio.muted).toBe(false);
    const effectAudio = store.playAudio("select.mp3", "effect", {
      loop: false,
      volume: 0.3,
    });
    expect(effectAudio.src).toBe("/mock/effects/select.mp3");
    expect(effectAudio.muted).toBe(false);
  });

  it("playAndSetBgMusic stops current, plays new background music", () => {
    const store = useAudioStore();
    const fakeAudio = new MockAudio("prev.mp3");
    store.bgMusicInstance = fakeAudio as any;
    store.playAndSetBgMusic("moonlight_sonata");
    expect(pauseMock).toHaveBeenCalled();
    expect(store.bgMusicInstance?.src).toContain("/mock/music/moonlight_sonata.mp3");
    expect(store.bgMusicInstance?.loop).toBe(true);
  });

  it("playMusic does nothing if muted", () => {
    const store = useAudioStore();
    store.musicMuted = true;
    store.playMusic();
    expect(store.bgMusicInstance).toBeNull();
  });

  it("playMusic plays the current track if not muted", () => {
    const store = useAudioStore();
    store.musicMuted = false;
    store.musicTrack = 1;
    store.playMusic();
    expect(store.bgMusicInstance?.src).toContain("moonlight_sonata");
    expect(playMock).toHaveBeenCalled();
  });

  it("stopMusic pauses and clears background music", () => {
    const store = useAudioStore();
    const fakeAudio = new MockAudio("x.mp3");
    store.bgMusicInstance = fakeAudio as any;
    store.stopMusic();
    expect(pauseMock).toHaveBeenCalled();
    expect(store.bgMusicInstance).toBeNull();
  });

  it("resumeMusicIfWasPlaying only resumes if flagged", () => {
    const store = useAudioStore();
    store._wasBackgroundPlaying = false;
    store.playMusic = vi.fn();
    store.resumeMusicIfWasPlaying();
    expect(store.playMusic).not.toHaveBeenCalled();
    store._wasBackgroundPlaying = true;
    store.resumeMusicIfWasPlaying();
    expect(store.playMusic).toHaveBeenCalled();
    expect(store._wasBackgroundPlaying).toBe(false);
  });

  it("playMenuMusicLoop does nothing if muted or already playing", () => {
    const store = useAudioStore();
    store.musicMuted = true;
    store.playMenuMusicLoop();
    expect(store.bgMusicInstance).toBeNull();
    store.musicMuted = false;
    store.bgMusicInstance = new MockAudio("already.mp3") as any;
    store.playMenuMusicLoop();
    expect(store.bgMusicInstance?.src).toBe("already.mp3");
  });

  it("playMenuMusicLoop starts menu music if not muted/playing", () => {
    const store = useAudioStore();
    store.musicMuted = false;
    store.bgMusicInstance = null;
    store.playMenuMusicLoop();
    expect((store.bgMusicInstance as any)?.src).toContain("liebestraum");
  });

  it("stopAllAudio pauses effect and background and sets flag", () => {
    const store = useAudioStore();
    const fakeAudio = new MockAudio("bg.mp3");
    const fakeEffect = new MockAudio("effect.mp3");
    store.bgMusicInstance = fakeAudio as any;
    store.effectInstance = fakeEffect as any;
    fakeAudio.paused = false;
    store.stopAllAudio();
    expect(pauseMock).toHaveBeenCalled();
    expect(store.effectInstance).toBeNull();
    expect(store._wasBackgroundPlaying).toBe(true);
  });

  it("stopAllAudio sets flag false if bgMusic was already paused", () => {
    const store = useAudioStore();
    const fakeAudio = new MockAudio("bg.mp3");
    fakeAudio.paused = true;
    store.bgMusicInstance = fakeAudio as any;
    store.stopAllAudio();
    expect(store._wasBackgroundPlaying).toBe(false);
  });

  it("playEffect does nothing if effects are muted", () => {
    const store = useAudioStore();
    store.effectsMuted = true;
    store.playAudio = vi.fn();
    store.playEffect("select"); // Use a valid effect key
    expect(store.playAudio).not.toHaveBeenCalled();
  });

  it("playEffect plays audio for normal effects", () => {
    const store = useAudioStore();
    store.effectsMuted = false;
    store.playAudio = vi.fn(() => new MockAudio("select")) as any;
    store.playEffect("select"); // Use a valid effect key
    expect(store.playAudio).toHaveBeenCalledWith("select", "effect", {
      volume: store.effectsVolume / 100,
    });
  });

  it("playEffect pauses bg music and sets flag for strong effects", () => {
    const store = useAudioStore();
    const fakeAudio = new MockAudio("bg.mp3");
    store.bgMusicInstance = fakeAudio as any;
    store.playAudio = vi.fn(() => new MockAudio("entertainer") as unknown as HTMLAudioElement) as typeof store.playAudio;
    store.effectInstance = null;
    store.effectsMuted = false;
    store.playEffect("entertainer"); // Use MUSIC_VICTORY
    expect(pauseMock).toHaveBeenCalled();
    expect(store.bgMusicInstance).toBeNull();
    expect(store._wasBackgroundPlaying).toBe(true);
    expect(store.effectInstance).not.toBeNull();
  });

  it("getMusicFileFromKey returns the correct file", () => {
    const store = useAudioStore();
    expect(store.getMusicFileFromKey(0)).toBe("trio_sonata_no_1");
    expect(store.getMusicFileFromKey(1)).toBe("moonlight_sonata");
  });

  it("playBackgroundForView type user plays user track", () => {
    const store = useAudioStore();
    store.playAudio = vi.fn(() => new MockAudio("trio_sonata_no_1") as unknown as HTMLAudioElement) as typeof store.playAudio;
    store.musicTrack = 0;
    store.playBackgroundForView({ type: "user" });
    expect(store.playAudio).toHaveBeenCalledWith("trio_sonata_no_1", "music", {
      loop: true,
      volume: store.musicVolume / 100,
    });
    expect(store.bgMusicInstance?.src).toContain("trio_sonata_no_1");
  });

  it("playBackgroundForView type fixed plays fixed track", () => {
    const store = useAudioStore();
    store.playAudio = vi.fn(() => new MockAudio("feuxfollets.mp3") as unknown as HTMLAudioElement) as typeof store.playAudio;
    store.playBackgroundForView({
      type: "fixed",
      file: "feuxfollets.mp3",
      loop: false,
      volume: 50,
    });
    expect(store.playAudio).toHaveBeenCalledWith("feuxfollets.mp3", "music", {
      loop: false,
      volume: 0.5,
    });
    expect(store.bgMusicInstance?.src).toContain("feuxfollets.mp3");
  });
});
