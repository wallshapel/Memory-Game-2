// 🖼️ Default image for card cover
export const DEFAULT_COVER_IMAGE = "default.png";

// 🛣️ Base path for images resources
export const BASE_PATH_IMAGE_RESOURCES = {
  THEMES_PATH: "/images/themes/",
  COVERS_PATH: "/images/covers/",
};

// Base path for images resources from backend
export const FULL_BASE_PATH_IMAGE_RESOURCES = {
  COVERS_PATH: `${import.meta.env.VITE_API_BASE}/uploads/images/covers/`,
};

// 🎆 Victory animation
export const FIREWORK_GIF = "/images/fireworks.gif";

// 🃏 Card display settings
export const CARD_DISPLAY_SETTINGS = {
  CARD_FLIP_ANIMATION_MS: 590, // duration of card flip animation in milliseconds
  CARD_PRESENTATION_DELAY_MS: 1000, // delay before revealing cards face-up at game start
};

// 📱 Breakpoints for responsive card sizes
export const BREAKPOINTS = {
  xs: { maxWidth: 539, cardWidth: 50, cardHeight: 75 },
  sm: { maxWidth: 640, cardWidth: 70, cardHeight: 105 },
  md: { maxWidth: 739, cardWidth: 80, cardHeight: 120 },
  lg: { maxWidth: Infinity, cardWidth: 90, cardHeight: 135 },
};

// 🃏 Default Cards size
export const DEFAULT_CARDS_SIZE = {
  width: 50,
  height: 75,
};

// 🟫 Board gap
export const BOARD_GAP = "8px" as const;

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
  0: "ANIMALS",
  1: "RICKANDMORTY",
  2: "FLAGS",
} as const;

// 🪜 Difficulty levels
export const DIFFICULTY_LEVELS = {
  0: "EASY",
  1: "MEDIUM",
  2: "HARD",
} as const;

export type GameThemeLiteral = keyof typeof GAME_THEMES; // 0 | 1 | 2
export type DifficultyLiteral = keyof typeof DIFFICULTY_LEVELS; // 0 | 1 | 2

/******************************************************************************************************************************************************************
 *                                                            A U D I O
 * ***************************************************************************************************************************************************************/

// 🛣️ Base paths for audio resources
export const BASE_PATH_AUDIO_RESOURCES = {
  MUSIC_PATH: "/sounds/music/",
  EFFECTS_PATH: "/sounds/effects/",
};

// 👂 Feedback when changing the effect volume
export const EFFECTS_VOLUME = "over.mp3";

// 🔈Sound effects for cards
export const GAME_EFFECTS = {
  EFFECT_SELECT: "select",
  EFFECT_SUCCESS: "success",
  EFFECT_ERROR: "error",
  EFFECT_OVER: "over",
} as const;

// 🎵 Background Music
export const BACKGROUND_MUSIC = {
  0: {
    file: "trio_sonata_no_1",
    label: "Triosonate Nr. 1 Es-Dur BWV 525",
  },
  1: {
    file: "moonlight_sonata",
    label:
      "Sonata quasi una Fantasia per il Clavicembalo o Forte-Piano Op. 27 No. 2",
  },
  2: {
    file: "ballade_no_2",
    label: "Ballade No. 2 en Fa majeur Op. 38",
  },
  3: {
    file: "god_blessing_in_solitude",
    label:
      "Harmonies poétiques et religieuses, S. 173. La bénédiction de Dieu dans la solitude",
  },
} as const;

// 🎵 Other musical backgrounds
export const OTHER_MUSICAL_BACKGROUNDS = {
  gameplay: "feuxfollets",
  settings: "liebestraum",
  records: "aquarium",
} as const;

// 🎵 Music for game results
export const GAME_SCORE_MUSIC = {
  MUSIC_VICTORY: "entertainer",
  MUSIC_GAME_OVER: "funeral",
} as const;
