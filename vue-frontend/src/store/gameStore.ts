import { defineStore } from "pinia";
import { ref, watch, computed } from "vue";
import { usePlayerStore } from "./playerStore";
import { useAudioStore } from "./audioStore";
import type { ICardData } from "../interfaces/ICardData";
import type { IThemeData } from "../interfaces/IThemeData";
import {
  CARD_DISPLAY_SETTINGS,
  DELAY_MEMORIZATION_PHASE,
  RESULT_MODAL_DELAY_MS,
  GAME_EFFECTS,
  GAME_SCORE_MUSIC,
} from "../constants/assets";
import { shuffleArray } from "../utils/shuffleArray";
import { themeFetchers } from "../api/themeFetchers";
import { saveRecord } from "../api/backend/records";

export const useGameStore = defineStore("game", () => {
  const playerStore = usePlayerStore();
  const audioStore = useAudioStore();
  const showSettingsModal = ref(false);

  const cards = ref<ICardData[]>([]);
  const firstCard = ref<ICardData | null>(null);
  const secondCard = ref<ICardData | null>(null);
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
      case 0: // EASY
        return pairs + 2;
      case 1: // MEDIUM
        return pairs;
      case 2: // HARD
        return pairs - 2;
      default:
        return pairs;
    }
  });

  async function initializeGame() {
    audioStore.stopAllAudio();
    audioStore.playGameMusicLoop();

    cards.value = [];
    cardsAreReady.value = false;

    if (presentationTimeout !== null) clearTimeout(presentationTimeout);
    if (memorizationTimeout !== null) clearTimeout(memorizationTimeout);
    if (chronometerStartTimeout !== null) clearTimeout(chronometerStartTimeout);

    presentationTimeout = null;
    memorizationTimeout = null;
    chronometerStartTimeout = null;

    let rawData: IThemeData[] = [];

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

    const duplicated: ICardData[] = rawData.flatMap((entry) => {
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
        0: DELAY_MEMORIZATION_PHASE.MEMORIZATION_DELAY_EASY,
        1: DELAY_MEMORIZATION_PHASE.MEMORIZATION_DELAY_MEDIUM,
        2: DELAY_MEMORIZATION_PHASE.MEMORIZATION_DELAY_HARD,
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

    audioStore.stopAllAudio();
    audioStore.playMusic();

    resetChronometer();
    initializeGame();
  }

  function handleCardClick(card: ICardData) {
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
      audioStore.playEffect(GAME_EFFECTS.EFFECT_SUCCESS);
      successCount.value++;
      resetSelection();
      checkWin();
    } else {
      audioStore.playEffect(GAME_EFFECTS.EFFECT_ERROR);
      failCount.value++;
      setTimeout(() => {
        firstCard.value!.flipped = false;
        secondCard.value!.flipped = false;
        resetSelection();
      }, CARD_DISPLAY_SETTINGS.CARD_PRESENTATION_DELAY_MS);
    }
  }

  async function checkWin() {
    if (hasWon.value) return;

    const matchedAll = cards.value.every((card) => card.matched);
    if (matchedAll) {
      hasWon.value = true;
      stopChronometer();
      await saveGameRecord();
      audioStore.stopAllAudio();
      audioStore.playEffect(GAME_SCORE_MUSIC.MUSIC_VICTORY);
      setTimeout(() => {
        showResultModal.value = true;
      }, RESULT_MODAL_DELAY_MS);
    }
  }

  // 🧠 Watch failCount and trigger Game Over after delay
  watch(failCount, async (newVal) => {
    if (newVal >= maxFails.value && !hasLost.value && !hasWon.value) {
      hasLost.value = true;
      stopChronometer();
      audioStore.stopAllAudio();
      audioStore.playEffect(GAME_SCORE_MUSIC.MUSIC_GAME_OVER);
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

    audioStore.stopAllAudio();
    audioStore._wasBackgroundPlaying = false;
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

  async function saveGameRecord() {
    const player = usePlayerStore();
    if (!player.name || player.name.trim().length === 0) return;
    await saveRecord({
      name: player.name,
      difficulty: player.difficulty,
      totalCards: player.totalCards,
      hits: successCount.value,
      mistakes: failCount.value,
      time: milliseconds.value,
    });
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
