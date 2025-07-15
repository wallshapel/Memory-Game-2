// 🖼️ Default image for card cover
export const DEFAULT_COVER_IMAGE = "/images/covers/default.png";

// Base path for images resources
export const BASE_PATH_IMAGE_RESOURCES = {
  THEMES_PATH: "/images/themes/",
  COVERS_PATH: "/images/covers/"
}

// 🎆 Victory animation
export const FIREWORK_GIF = "/images/fireworks.gif";

// 🔊 Base paths for audio resources
export const BASE_PATH_AUDIO_RESOURCES = {
  MUSIC_PATH: "/sounds/backgrounds/",
  EFFECTS_PATH: "/sounds/effects/",
};

// 👂 Feedback when changing the effect volume
export const EFFECT_VOLUME = "over.mp3";

// 🔈Sound effects for hits and misses
export const SOUND_EFFECTS_HIT_FAILS = {
  EFFECT_SELECT: "select",
  EFFECT_SUCCESS: "success",
  EFFECT_ERROR: "error",
  EFFECT_OVER: "over",
} as const;

// 🎵 Background Music
export const BACKGROUND_MUSIC = {
  BACH: {
    file: "trio_sonata_no_1",
    label: "Triosonate Nr. 1 Es-Dur BWV 525",
  },
  BEETHOVEN: {
    file: "moonlight_sonata",
    label:
      "Sonata quasi una Fantasia per il Clavicembalo o Forte-Piano Op. 27 No. 2",
  },
  CHOPIN: {
    file: "ballade_no_2",
    label: "Ballade No. 2 en Fa majeur Op. 38",
  },
  LISZT: {
    file: "god_blessing_in_solitude",
    label:
      "Harmonies poétiques et religieuses, S. 173. La bénédiction de Dieu dans la solitude",
  },
} as const;

// 🎵 Default background music
export const DEFAULT_BACKGROUND = {
  composer: "BACH",
  work: "trio_sonata_no_1",
};

// 🎵 Sound effects for game results
export const SOUND_EFFECTS_GAME_RESULT = {
  EFFECT_VICTORY: "entertainer",
  EFFECT_GAME_OVER: "funeral",
} as const;

// 🃏 Card display settings
export const CARD_DISPLAY_SETTINGS = {
  CARD_FLIP_ANIMATION_MS: 590, // duration of card flip animation in milliseconds
  CARD_PRESENTATION_DELAY_MS: 1000, // delay before revealing cards face-up at game start
};

// ⏳ Delay for memorization phase (cards face-up) by difficulty
export const DELAY_MEMORIZATION_PHASE = {
  MEMORIZATION_DELAY_EASY: 14000,
  MEMORIZATION_DELAY_MEDIUM: 10000,
  MEMORIZATION_DELAY_HARD: 8000,
};

// ⏱️ Delay before showing the result modal
export const RESULT_MODAL_DELAY_MS = 1500;

// 🎯 Game themes
export const GAME_THEMES = {
  ANIMALS: "ANIMALS",
  RICKANDMORTY: "RICKANDMORTY",
  FLAGS: "FLAGS",
} as const;

// 🎮 Difficulty levels
export const DIFFICULTY_LEVELS = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
} as const;
