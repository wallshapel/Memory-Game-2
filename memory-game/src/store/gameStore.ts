import { defineStore } from "pinia";
import { ref, watch, computed } from "vue";
import { usePlayerStore } from "./playerStore";
import type { CardData } from "../types/CardData";
import type { ThemeData } from "../types/ThemeData";
import {
  CARD_DISPLAY_SETTINGS,
  DELAY_MEMORIZATION_PHASE,
  RESULT_MODAL_DELAY_MS,
  SOUND_EFFECTS_HIT_FAILS,
  SOUND_EFFECTS_GAME_RESULT,
  DIFFICULTY_LEVELS
} from "../constants/assets";
import { shuffleArray } from "../utils/shuffleArray";
import { themeFetchers } from "../api/themeFetchers";

export const useGameStore = defineStore("game", () => {
  const playerStore = usePlayerStore();
  const showSettingsModal = ref(false);

  const cards = ref<CardData[]>([]);
  const firstCard = ref<CardData | null>(null);
  const secondCard = ref<CardData | null>(null);
  const focusedIndex = ref(0);
  const cardsAreReady = ref(false);

  const successCount = ref(0);
  const failCount = ref(0);

  const hasWon = ref(false);
  const hasLost = ref(false);
  const showResultModal = ref(false);

  const milliseconds = ref(0);
  let interval: number | null = null;

  // 🕒 Timeout references to prevent orphan timers
  let presentationTimeout: number | null = null;
  let memorizationTimeout: number | null = null;
  let chronometerStartTimeout: number | null = null;
  let resultModalTimeout: number | null = null;

  const maxFails = computed(() => {
    const pairs = playerStore.totalCards / 2;
    switch (playerStore.difficulty) {
      case DIFFICULTY_LEVELS.EASY:
        return pairs + 2;
      case DIFFICULTY_LEVELS.MEDIUM:
        return pairs;
      case DIFFICULTY_LEVELS.HARD:
        return pairs - 2;
      default:
        return pairs;
    }
  });

  async function initializeGame() {
    cards.value = [];
    cardsAreReady.value = false;

    if (presentationTimeout !== null) clearTimeout(presentationTimeout);
    if (memorizationTimeout !== null) clearTimeout(memorizationTimeout);
    if (chronometerStartTimeout !== null) clearTimeout(chronometerStartTimeout);

    presentationTimeout = null;
    memorizationTimeout = null;
    chronometerStartTimeout = null;

    let rawData: ThemeData[] = [];

    try {
      const theme = playerStore.theme;
      const fetcher = themeFetchers[theme];

      if (!fetcher) 
        throw new Error(`No fetcher available for theme "${theme}"`);

      const needed = playerStore.totalCards / 2;
      rawData = await fetcher(needed);
    } catch (err) {
      console.error("Error fetching cards:", err);
      return;
    }

    const duplicated: CardData[] = rawData.flatMap((entry) => {
      if (!entry.name || !entry.imageUrl) return [];

      return [0, 1].map((suffix) => ({
        id: `${entry.name}-${suffix}`,
        name: entry.name,
        image: entry.imageUrl,
        matched: false,
        flipped: false,
        blocked: true,
      }));
    });

    cards.value = shuffleArray(duplicated);

    presentationTimeout = setTimeout(() => {
      cards.value.forEach((card) => (card.flipped = true));

      const delayMap = {
        [DIFFICULTY_LEVELS.EASY]:
          DELAY_MEMORIZATION_PHASE.MEMORIZATION_DELAY_EASY,
        [DIFFICULTY_LEVELS.MEDIUM]:
          DELAY_MEMORIZATION_PHASE.MEMORIZATION_DELAY_MEDIUM,
        [DIFFICULTY_LEVELS.HARD]:
          DELAY_MEMORIZATION_PHASE.MEMORIZATION_DELAY_HARD,
      };

      const delay = delayMap[playerStore.difficulty];

      memorizationTimeout = setTimeout(() => {
        cards.value.forEach((card) => {
          card.flipped = false;
          card.blocked = false;
        });

        chronometerStartTimeout = setTimeout(() => {
          resetChronometer();
          startChronometer();
          cardsAreReady.value = true;
        }, CARD_DISPLAY_SETTINGS.CARD_FLIP_ANIMATION_MS);
      }, delay);
    }, CARD_DISPLAY_SETTINGS.CARD_PRESENTATION_DELAY_MS);
  }

  function resetGame() {
    hasWon.value = false;
    hasLost.value = false;
    successCount.value = 0;
    failCount.value = 0;
    firstCard.value = null;
    secondCard.value = null;
    focusedIndex.value = 0;
    cardsAreReady.value = false;

    playerStore.stopAllAudio();
    playerStore.playMusic();

    resetChronometer();
    initializeGame();
  }

  function handleCardClick(card: CardData) {
    if (hasWon.value || hasLost.value) return;
    if (card.flipped || card.blocked || secondCard.value) return;

    card.flipped = true;

    if (!firstCard.value) firstCard.value = card;
    else {
      secondCard.value = card;
      checkMatch();
    }
  }

  function checkMatch() {
    if (!firstCard.value || !secondCard.value) return;

    const isMatch = firstCard.value.name === secondCard.value.name;

    if (isMatch) {
      firstCard.value.matched = true;
      secondCard.value.matched = true;
      firstCard.value.blocked = true;
      secondCard.value.blocked = true;
      playerStore.playEffect(SOUND_EFFECTS_HIT_FAILS.EFFECT_SUCCESS);
      successCount.value++;
      resetSelection();
      checkWin();
    } else {
      playerStore.playEffect(SOUND_EFFECTS_HIT_FAILS.EFFECT_ERROR);
      failCount.value++;
      setTimeout(() => {
        firstCard.value!.flipped = false;
        secondCard.value!.flipped = false;
        resetSelection();
      }, CARD_DISPLAY_SETTINGS.CARD_PRESENTATION_DELAY_MS);
    }
  }

  function checkWin() {
    if (hasWon.value) return;

    const matchedAll = cards.value.every((card) => card.matched);
    if (matchedAll) {
      hasWon.value = true;
      stopChronometer();
      playerStore.playEffect(SOUND_EFFECTS_GAME_RESULT.EFFECT_VICTORY);
      setTimeout(() => {
        showResultModal.value = true;
      }, RESULT_MODAL_DELAY_MS);
    }
  }

  // 🧠 Watch failCount and trigger Game Over after delay
  watch(failCount, (newVal) => {
    if (newVal >= maxFails.value && !hasLost.value && !hasWon.value) {
      hasLost.value = true;
      stopChronometer();
      playerStore.playEffect(SOUND_EFFECTS_GAME_RESULT.EFFECT_GAME_OVER);

      resultModalTimeout = setTimeout(() => {
        showResultModal.value = true;
        resultModalTimeout = null;
      }, RESULT_MODAL_DELAY_MS);
    }
  });

  function resetSelection() {
    firstCard.value = null;
    secondCard.value = null;
  }

  function clearGame() {
    // ⛔ Cancel all pending timeouts
    if (resultModalTimeout) {
      clearTimeout(resultModalTimeout);
      resultModalTimeout = null;
    }
    if (presentationTimeout) {
      clearTimeout(presentationTimeout);
      presentationTimeout = null;
    }
    if (memorizationTimeout) {
      clearTimeout(memorizationTimeout);
      memorizationTimeout = null;
    }
    if (chronometerStartTimeout) {
      clearTimeout(chronometerStartTimeout);
      chronometerStartTimeout = null;
    }

    cards.value = [];
    firstCard.value = null;
    secondCard.value = null;
    successCount.value = 0;
    failCount.value = 0;
    hasWon.value = false;
    hasLost.value = false;
    showResultModal.value = false;
    focusedIndex.value = 0;
    cardsAreReady.value = false;

    stopChronometer();
    milliseconds.value = 0;

    playerStore.stopAllAudio();
    playerStore._wasBackgroundPlaying = false;
  }

  const formattedTime = computed(() => {
    const ms = milliseconds.value % 1000;
    const totalSeconds = Math.floor(milliseconds.value / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    const millis = String(ms).padStart(3, "0");
    return `${minutes}:${seconds}:${millis}`;
  });

  function startChronometer() {
    if (interval !== null) return;
    interval = setInterval(() => {
      milliseconds.value += 10;
    }, 10);
  }

  function stopChronometer() {
    if (interval !== null) {
      clearInterval(interval);
      interval = null;
    }
  }

  function resetChronometer() {
    stopChronometer();
    milliseconds.value = 0;
  }

  return {
    cards,
    firstCard,
    secondCard,
    successCount,
    failCount,
    hasWon,
    hasLost,
    showResultModal,
    maxFails,
    showSettingsModal,
    formattedTime,
    focusedIndex,
    cardsAreReady,
    resetGame,
    initializeGame,
    handleCardClick,
    checkMatch,
    checkWin,
    resetSelection,
    clearGame,
    startChronometer,
    stopChronometer,
    resetChronometer,
  };
});
