// src/store/gameStore.ts
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
  OTHER_MUSICAL_BACKGROUNDS,
} from "../constants/assets";
import { shuffleArray } from "../utils/shuffleArray";
import { themeFetchers } from "../api/themeFetchers";
import { saveRecord } from "../api/backend/records";

/**
 * Pinia store that manages all game state for the memory game, including
 * cards, timers, scoring, audio cues, and modes (normal, countdown).
 * Provides all core logic for initializing, running, and resetting a game session.
 */
export const useGameStore = defineStore("game", () => {
  // ==== Stores ====
  const playerStore = usePlayerStore();
  const audioStore = useAudioStore();

  // ==== Game state (reactive) ====
  const showSettingsModal = ref(false);
  const isCountdownMode = ref(false);
  const countdownLimit = ref(0);

  const cards = ref<ICardData[]>([]);
  const firstCard = ref<ICardData | null>(null);
  const secondCard = ref<ICardData | null>(null);
  const focusedIndex = ref(0);
  const cardsAreReady = ref(false);

  const successCount = ref(0);
  const failCount = ref(0);
  const mistakesMade = ref(0);
  const didBeatRecord = ref(false);
  const targetRecordTime = ref<number | null>(null);

  const hasWon = ref(false);
  const hasLost = ref(false);
  const showResultModal = ref(false);

  const milliseconds = ref(0);
  let interval: number | null = null;

  const initialMistakesAllowed = ref<number | null>(null);

  // Timeout handles (internal, non-reactive)
  let presentationTimeout: number | null = null;
  let memorizationTimeout: number | null = null;
  let chronometerStartTimeout: number | null = null;
  let resultModalTimeout: number | null = null;

  /**
   * Computes the maximum number of failed attempts allowed for the current difficulty.
   */
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

  /**
   * Initializes a new game session: shuffles cards, resets timers and state,
   * and starts background music for the current mode.
   * Also handles the memorization and presentation timeouts before play starts.
   */
  async function initializeGame() {
    // Centralized audio: always use playBackgroundForView
    audioStore.stopAllAudio();
    if (isCountdownMode.value) {
      audioStore.playBackgroundForView({
        type: "fixed",
        file: OTHER_MUSICAL_BACKGROUNDS.timetrial,
        loop: true,
      });
    } else {
      audioStore.playBackgroundForView({
        type: "fixed",
        file: OTHER_MUSICAL_BACKGROUNDS.gameplay,
        loop: true,
      });
    }

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
          failCount.value =
            isCountdownMode.value && initialMistakesAllowed.value !== null
              ? initialMistakesAllowed.value
              : 0;

          resetChronometer();
          startChronometer();
          cardsAreReady.value = true;
        }, CARD_DISPLAY_SETTINGS.CARD_FLIP_ANIMATION_MS);
      }, delay);
    }, CARD_DISPLAY_SETTINGS.CARD_PRESENTATION_DELAY_MS);
  }

  /**
   * Resets the entire game session, including state, scores and timers.
   * Calls `initializeGame()` after reset.
   */
  function resetGame() {
    hasWon.value = false;
    hasLost.value = false;
    successCount.value = 0;
    failCount.value =
      isCountdownMode.value && initialMistakesAllowed.value !== null
        ? initialMistakesAllowed.value
        : 0;
    mistakesMade.value = 0;
    firstCard.value = null;
    secondCard.value = null;
    focusedIndex.value = 0;
    cardsAreReady.value = false;

    audioStore.stopAllAudio();

    resetChronometer();
    void initializeGame();
  }

  /**
   * Handles a card click by the user, updating selection and triggering match logic.
   * Ignores clicks when game is won/lost or invalid selection.
   * @param card - The card that was clicked.
   */
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

  /**
   * Checks if the two selected cards match.
   * Updates score, plays effect, handles win/loss logic and unflips on mismatch.
   */
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
      void checkWin();
    } else {
      audioStore.playEffect(GAME_EFFECTS.EFFECT_ERROR);
      mistakesMade.value++;
      if (isCountdownMode.value) failCount.value--;
      else failCount.value++;
      setTimeout(() => {
        firstCard.value!.flipped = false;
        secondCard.value!.flipped = false;
        resetSelection();
      }, CARD_DISPLAY_SETTINGS.CARD_PRESENTATION_DELAY_MS);
    }
  }

  /**
   * Checks for win condition. Triggers victory music, stops chronometer, and shows result modal if won.
   */
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

  // Watch failCount and trigger Game Over after delay if reached.
  watch(failCount, (newVal) => {
    const failCondition = isCountdownMode.value
      ? newVal < 0
      : newVal >= maxFails.value;

    if (failCondition && !hasLost.value && !hasWon.value) {
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

  /**
   * Clears the currently selected cards (after match/mismatch).
   */
  function resetSelection() {
    firstCard.value = null;
    secondCard.value = null;
  }

  /**
   * Completely resets all game state and timers, cancels timeouts, and returns store to initial state.
   * Does NOT start a new game session.
   */
  function clearGame() {
    // Cancel all pending timeouts
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
    mistakesMade.value = 0;
    hasWon.value = false;
    hasLost.value = false;
    showResultModal.value = false;
    focusedIndex.value = 0;
    cardsAreReady.value = false;

    stopChronometer();
    milliseconds.value = 0;

    audioStore.stopAllAudio();
    audioStore._wasBackgroundPlaying = false;

    isCountdownMode.value = false;
    countdownLimit.value = 0;
  }

  /**
   * Returns the formatted elapsed/remaining time in mm:ss:ms for UI display.
   */
  const formattedTime = computed(() => {
    const ms = milliseconds.value % 1000;
    const totalSeconds = Math.floor(milliseconds.value / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    const millis = String(ms).padStart(3, "0");
    return `${minutes}:${seconds}:${millis}`;
  });

  /**
   * Starts the game chronometer (either counting up or down).
   * Handles timeouts and triggers game over if timer runs out.
   */
  function startChronometer() {
    if (interval !== null) return;
    interval = setInterval(() => {
      if (isCountdownMode.value) {
        milliseconds.value -= 10;
        if (milliseconds.value <= 0) {
          milliseconds.value = 0;
          stopChronometer();
          handleTimeOut();
        }
      } else milliseconds.value += 10;
    }, 10);
  }

  /**
   * Handles timeout event when countdown timer reaches zero.
   * Sets game as lost, plays sound and shows result modal.
   */
  function handleTimeOut() {
    if (!hasWon.value && !hasLost.value) {
      hasLost.value = true;
      audioStore.stopAllAudio();
      audioStore.playEffect(GAME_SCORE_MUSIC.MUSIC_GAME_OVER);
      resultModalTimeout = setTimeout(() => {
        showResultModal.value = true;
      }, RESULT_MODAL_DELAY_MS);
    }
  }

  /**
   * Stops the chronometer/timer for the current session.
   */
  function stopChronometer() {
    if (interval !== null) {
      clearInterval(interval);
      interval = null;
    }
  }

  /**
   * Resets the chronometer to start value (0 or countdownLimit).
   */
  function resetChronometer() {
    stopChronometer();
    milliseconds.value = isCountdownMode.value ? countdownLimit.value : 0;
  }

  /**
   * Persists a new game record to the backend, using current scores/times.
   * Also checks if a record was beaten (in countdown mode).
   */
  async function saveGameRecord() {
    const player = usePlayerStore();
    if (!player.name || player.name.trim().length === 0) return;

    // Calculates the ACTUAL time used depending on the mode.
    const timeUsed = isCountdownMode.value
      ? countdownLimit.value - milliseconds.value // Used = total - remaining
      : milliseconds.value;

    didBeatRecord.value = false;
    if (isCountdownMode.value && targetRecordTime.value !== null) {
      if (timeUsed < targetRecordTime.value) {
        didBeatRecord.value = true;
      }
    }

    await saveRecord({
      name: player.name,
      difficulty: player.difficulty,
      totalCards: player.totalCards,
      hits: successCount.value,
      mistakes: mistakesMade.value,
      time: timeUsed,
    });
  }

  /**
   * Sets the countdown/time-attack mode parameters for the session.
   * @param ms - Time limit in milliseconds.
   * @param allowedMistakes - Initial allowed mistakes for countdown mode.
   * @param targetTime - Optional target record time.
   */
  function setCountdownMode(
    ms: number,
    allowedMistakes: number,
    targetTime?: number
  ) {
    isCountdownMode.value = true;
    countdownLimit.value = ms;
    initialMistakesAllowed.value = allowedMistakes;
    targetRecordTime.value = typeof targetTime === "number" ? targetTime : null;
  }

  /**
   * Updates the target record time and allowed mistakes for countdown mode.
   * Also updates the countdown limit to match the new target time.
   * @param newTime - The new record time in milliseconds to set as target
   * @param newMistakes - The new allowed mistakes count for countdown mode
   */
  function updateTargetRecord(newTime: number, newMistakes: number) {
    if (isCountdownMode.value) {
      targetRecordTime.value = newTime;
      initialMistakesAllowed.value = newMistakes;
      countdownLimit.value = newTime; // Update the counter limit
    }
  }

  // ==== Exposed state and actions ====
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
    isCountdownMode,
    countdownLimit,
    milliseconds,
    mistakesMade,
    didBeatRecord,
    targetRecordTime,
    initialMistakesAllowed,
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
    setCountdownMode,
    updateTargetRecord,
    handleTimeOut,
    saveGameRecord
  };
});
