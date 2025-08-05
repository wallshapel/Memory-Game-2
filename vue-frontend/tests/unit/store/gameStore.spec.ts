import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { nextTick } from "vue";

// MOCK GLOBAL AUDIO!
globalThis.Audio = vi.fn().mockImplementation(() => ({
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})) as any;

// Real Pinia and stores (DO NOT mock playerStore here)
import { setActivePinia, createPinia } from "pinia";
import { useGameStore } from "../../../src/store/gameStore";
import { usePlayerStore } from "../../../src/store/playerStore";

// Import real constants
import {
  CARD_DISPLAY_SETTINGS,
  DELAY_MEMORIZATION_PHASE,
} from "../../../src/constants/assets";

// Mocks only for secondary dependencies
vi.mock("../../../src/store/audioStore", () => ({
  useAudioStore: vi.fn(() => ({
    stopAllAudio: vi.fn(),
    playBackgroundForView: vi.fn(),
    playEffect: vi.fn(),
    _wasBackgroundPlaying: false,
  })),
}));
vi.mock("../../../src/api/themeFetchers", () => ({
  themeFetchers: [
    vi.fn(async (needed) => [
      { name: "A", imageUrl: "a.png" },
      { name: "B", imageUrl: "b.png" },
    ]),
  ],
}));
vi.mock("../../../src/api/backend/records", () => ({
  saveRecord: vi.fn(async () => {}),
}));
vi.mock("../../../src/utils/shuffleArray", () => ({
  shuffleArray: vi.fn((arr) => arr),
}));

describe("gameStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("initializes the game correctly", async () => {
    const store = useGameStore();
    const playerStore = usePlayerStore();
    playerStore.theme = 0;
    playerStore.totalCards = 4;
    await store.initializeGame();
    store.cards.forEach((card) => {
      card.flipped = false;
      card.blocked = false;
    });
    expect(store.cards.length).toBe(4);
    expect(store.cards[0].matched).toBe(false);
    expect(store.cards[0].flipped).toBe(false);
  });

  it("handles a valid click on a card (first click)", async () => {
    const store = useGameStore();
    const playerStore = usePlayerStore();
    playerStore.theme = 0;
    playerStore.totalCards = 4;
    await store.initializeGame();
    store.cards.forEach((card) => {
      card.flipped = false;
      card.blocked = false;
    });
    const card = store.cards[0];
    store.handleCardClick(card);
    await Promise.resolve();
    expect(card.flipped).toBe(true);
    expect(store.firstCard).toBe(card);
    expect(store.secondCard).toBe(null);
  });

  it("does not allow click if the game is won or lost", async () => {
    const store = useGameStore();
    const playerStore = usePlayerStore();
    playerStore.theme = 0;
    playerStore.totalCards = 4;
    await store.initializeGame();
    store.cards.forEach((card) => {
      card.flipped = false;
      card.blocked = false;
    });
    const card = store.cards[0];

    store.hasWon = true;
    store.handleCardClick(card);
    await Promise.resolve();
    expect(card.flipped).toBe(false);

    store.hasWon = false;
    store.hasLost = true;
    store.handleCardClick(card);
    await Promise.resolve();
    expect(card.flipped).toBe(false);
  });

  it("on match, increments successCount and blocks cards", async () => {
    const store = useGameStore();
    const playerStore = usePlayerStore();
    playerStore.theme = 0;
    playerStore.totalCards = 4;
    await store.initializeGame();
    store.cards.forEach((card) => {
      card.flipped = false;
      card.blocked = false;
    });
    const allA = store.cards.filter((c) => c.name === "A");
    expect(allA.length).toBe(2);
    const a1 = allA[0];
    const a2 = allA[1];
    store.handleCardClick(a1);
    store.handleCardClick(a2);
    await Promise.resolve();
    expect(a1.matched).toBe(true);
    expect(a2.matched).toBe(true);
    expect(a1.blocked).toBe(true);
    expect(a2.blocked).toBe(true);
    expect(store.successCount).toBe(1);
    expect(store.firstCard).toBe(null);
    expect(store.secondCard).toBe(null);
  });

  it("on no match, increments mistakesMade and resets selection", async () => {
    vi.useFakeTimers(); // Activar fake timers

    const store = useGameStore();
    const playerStore = usePlayerStore();
    playerStore.theme = 0;
    playerStore.totalCards = 4;
    await store.initializeGame();
    store.cards.forEach((card) => {
      card.flipped = false;
      card.blocked = false;
    });
    const allA = store.cards.filter((c) => c.name === "A");
    const allB = store.cards.filter((c) => c.name === "B");
    expect(allA.length).toBe(2);
    expect(allB.length).toBe(2);
    const a = allA[0];
    const b = allB[0];
    store.handleCardClick(a);
    store.handleCardClick(b);
    expect(store.mistakesMade).toBe(1);

    // Advance time artificially (the timeout for deflipping is usually 1000ms).
    vi.advanceTimersByTime(1100);

    expect(a.flipped).toBe(false);
    expect(b.flipped).toBe(false);
  });

  it("resetGame properly resets the state", async () => {
    const store = useGameStore();
    const playerStore = usePlayerStore();
    playerStore.theme = 0;
    playerStore.totalCards = 4;
    await store.initializeGame();
    store.cards.forEach((card) => {
      card.flipped = false;
      card.blocked = false;
    });
    const allA = store.cards.filter((c) => c.name === "A");
    expect(allA.length).toBe(2);
    const a1 = allA[0];
    const a2 = allA[1];
    store.handleCardClick(a1);
    store.handleCardClick(a2);
    await Promise.resolve();
    store.hasWon = true;
    store.mistakesMade = 5;
    store.focusedIndex = 3;
    store.successCount = 1;
    await store.resetGame();

    expect(store.hasWon).toBe(false);
    expect(store.hasLost).toBe(false);
    expect(store.successCount).toBe(0);
    expect(store.mistakesMade).toBe(0);
    expect(store.focusedIndex).toBe(0);
    expect(store.firstCard).toBe(null);
    expect(store.secondCard).toBe(null);
    expect(store.cardsAreReady).toBe(false);
  });

  it("clearGame clears all state completely", async () => {
    const store = useGameStore();
    const playerStore = usePlayerStore();
    playerStore.theme = 0;
    playerStore.totalCards = 4;
    await store.initializeGame();
    store.cards.forEach((card) => {
      card.flipped = false;
      card.blocked = false;
    });
    store.successCount = 2;
    store.hasWon = true;
    store.firstCard = store.cards[0];
    store.secondCard = store.cards[1];
    store.cardsAreReady = true;
    store.isCountdownMode = true;
    store.countdownLimit = 1234;
    store.milliseconds = 5678;

    store.clearGame();
    expect(store.successCount).toBe(0);
    expect(store.hasWon).toBe(false);
    expect(store.cards.length).toBe(0);
    expect(store.firstCard).toBe(null);
    expect(store.secondCard).toBe(null);
    expect(store.cardsAreReady).toBe(false);
    expect(store.isCountdownMode).toBe(false);
    expect(store.countdownLimit).toBe(0);
    expect(store.milliseconds).toBe(0);
  });

  it("setCountdownMode sets countdown mode correctly", () => {
    const store = useGameStore();
    store.setCountdownMode(60000, 2, 30000);
    expect(store.isCountdownMode).toBe(true);
    expect(store.countdownLimit).toBe(60000);
    expect(store.initialMistakesAllowed).toBe(2);
    expect(store.targetRecordTime).toBe(30000);
  });

  // ---- TESTS DE maxFails ----
  it("computed maxFails calculates correctly for EASY", () => {
    setActivePinia(createPinia());
    const playerStore = usePlayerStore();
    playerStore.difficulty = 0;
    playerStore.totalCards = 8;
    const store = useGameStore();
    expect(store.maxFails).toBe(6); // 8/2 + 2
  });

  it("computed maxFails calculates correctly for MEDIUM", () => {
    setActivePinia(createPinia());
    const playerStore = usePlayerStore();
    playerStore.difficulty = 1;
    playerStore.totalCards = 8;
    const store = useGameStore();
    expect(store.maxFails).toBe(4); // 8/2
  });

  it("computed maxFails calculates correctly for HARD", () => {
    setActivePinia(createPinia());
    const playerStore = usePlayerStore();
    playerStore.difficulty = 2;
    playerStore.totalCards = 8;
    const store = useGameStore();
    expect(store.maxFails).toBe(2); // 8/2 - 2
  });

  it("initializeGame initializes and sets up cards correctly (normal mode)", async () => {
    vi.useFakeTimers();

    setActivePinia(createPinia());
    const store = useGameStore();
    const playerStore = usePlayerStore();
    playerStore.theme = 0;
    playerStore.totalCards = 4;
    playerStore.difficulty = 0; // EASY

    store.isCountdownMode = false;

    // Start game (returns promise by fetch)
    const initializationPromise = store.initializeGame();
    await initializationPromise; // Wait for letter fetch

    // Simulates the passage of presentation and memorisation time and flip animation
    vi.advanceTimersByTime(CARD_DISPLAY_SETTINGS.CARD_PRESENTATION_DELAY_MS); // Presentation (1000ms)
    vi.advanceTimersByTime(DELAY_MEMORIZATION_PHASE.MEMORIZATION_DELAY_EASY); // Memorisation (14000ms)
    vi.advanceTimersByTime(CARD_DISPLAY_SETTINGS.CARD_FLIP_ANIMATION_MS); // Final flip (590ms)

    //  Now you can make the asserts:
    expect(store.cards.length).toBe(4);

    store.cards.forEach((card) => {
      expect(card.blocked).toBe(false);
      expect(card.flipped).toBe(false);
    });
    expect(store.cardsAreReady).toBe(true);

    vi.useRealTimers();
  });

  it("initializeGame does nothing if the selected theme has no fetcher", async () => {
    const store = useGameStore();
    const playerStore = usePlayerStore();
    playerStore.theme = 99; // invalid theme
    playerStore.totalCards = 4;

    // Optional: spy on console.error to assert that the error occurs.
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await store.initializeGame();

    expect(store.cards.length).toBe(0); // No letters
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error fetching cards:"),
      expect.objectContaining({
        message: expect.stringContaining("No fetcher available"),
      })
    );
    errorSpy.mockRestore();
  });

  it("initializeGame does nothing if the fetcher throws an error", async () => {
    // We keep the original fetcher
    const { themeFetchers } = await import("../../../src/api/themeFetchers");
    const originalFetcher = themeFetchers[0];
    themeFetchers[0] = vi.fn(async () => {
      throw new Error("Missed the fetch!");
    });

    const store = useGameStore();
    const playerStore = usePlayerStore();
    playerStore.theme = 0;
    playerStore.totalCards = 4;

    // Spy on the error
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await store.initializeGame();

    expect(store.cards.length).toBe(0);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error fetching cards:"),
      expect.objectContaining({ message: "Missed the fetch!" })
    );

    // We restore original fetcher
    themeFetchers[0] = originalFetcher;
    errorSpy.mockRestore();
  });

  it("resetGame sets failCount depending on the mode: 0 in normal, initialMistakesAllowed in countdown", async () => {
    // Normal mode
    const store = useGameStore();
    store.isCountdownMode = false;
    // Set to any value other than 0 to test the reset.
    store.failCount = 42;

    await store.resetGame();
    expect(store.failCount).toBe(0);

    // Countdown mode
    store.isCountdownMode = true;
    store.initialMistakesAllowed = 7;
    // We put any value first
    store.failCount = 1;

    await store.resetGame();
    expect(store.failCount).toBe(7);
  });

  it("handleCardClick ignores clicks if card is flipped, blocked or secondCard is already set", async () => {
    const store = useGameStore();
    const playerStore = usePlayerStore();
    playerStore.theme = 0;
    playerStore.totalCards = 4;
    await store.initializeGame();

    // Simulate unblocked and unturned cards
    store.cards.forEach((card) => {
      card.flipped = false;
      card.blocked = false;
    });

    const card = store.cards[0];

    // 1. If you are already flipped
    card.flipped = true;
    store.handleCardClick(card);
    expect(store.firstCard).toBe(null);

    // 2. If it is blocked
    card.flipped = false;
    card.blocked = true;
    store.handleCardClick(card);
    expect(store.firstCard).toBe(null);

    // 3. If there is already a secondCard
    card.blocked = false;
    store.secondCard = store.cards[1];
    store.handleCardClick(card);
    expect(card.flipped).toBe(false);
  });

  it("checkMatch does nothing if firstCard or secondCard is null", () => {
    const store = useGameStore();

    // Case 1: both null
    store.firstCard = null;
    store.secondCard = null;
    expect(() => store.checkMatch()).not.toThrow();

    // Case 2: only firstCard present
    store.firstCard = { name: "A" } as any;
    store.secondCard = null;
    expect(() => store.checkMatch()).not.toThrow();

    // Case 3: only secondCard present
    store.firstCard = null;
    store.secondCard = { name: "A" } as any;
    expect(() => store.checkMatch()).not.toThrow();

    // Optional: verify that neither successCount nor mistakesMade changes
    expect(store.successCount).toBe(0);
    expect(store.mistakesMade).toBe(0);
  });

  it("failCount watcher: loses and shows modal if max fails are reached in normal mode", async () => {
    vi.useFakeTimers();

    const store = useGameStore();
    const playerStore = usePlayerStore();
    playerStore.theme = 0;
    playerStore.totalCards = 4;
    playerStore.difficulty = 0; // EASY
    await store.initializeGame();

    store.cards.forEach((card) => {
      card.flipped = false;
      card.blocked = false;
    });

    store.failCount = store.maxFails - 1;
    store.hasLost = false;
    store.hasWon = false;
    store.mistakesMade = 0;

    store.failCount++;
    await nextTick();

    expect(store.hasLost).toBe(true);
    expect(store.showResultModal).toBe(false);

    vi.advanceTimersByTime(1500);
    expect(store.showResultModal).toBe(true);

    vi.useRealTimers();
  });

  it("failCount watcher: loses and shows modal if failCount < 0 in countdown mode", async () => {
    vi.useFakeTimers();

    const store = useGameStore();
    store.isCountdownMode = true;
    store.hasLost = false;
    store.hasWon = false;
    store.failCount = 0;

    store.failCount = -1;
    await nextTick();

    expect(store.hasLost).toBe(true);
    expect(store.showResultModal).toBe(false);

    vi.advanceTimersByTime(1500);
    expect(store.showResultModal).toBe(true);

    vi.useRealTimers();
  });

  it("startChronometer does not create multiple intervals if already running", () => {
    const store = useGameStore();
    store.isCountdownMode = false;

    // Call twice
    store.startChronometer();
    const currentInterval = (store as any).interval;
    store.startChronometer();
    expect((store as any).interval).toBe(currentInterval);

    store.stopChronometer(); // Cleaning
  });

  it("stopChronometer does not fail if no interval is active", () => {
    const store = useGameStore();
    // No interval
    expect(() => store.stopChronometer()).not.toThrow();
  });

  it("resetChronometer resets milliseconds to 0 or countdownLimit based on mode", () => {
    const store = useGameStore();

    // Normal mode
    store.isCountdownMode = false;
    store.milliseconds = 999;
    store.resetChronometer();
    expect(store.milliseconds).toBe(0);

    // Countdown mode
    store.isCountdownMode = true;
    store.countdownLimit = 12345;
    store.milliseconds = 5;
    store.resetChronometer();
    expect(store.milliseconds).toBe(12345);

    store.stopChronometer(); // Cleaning
  });

  it("handleTimeOut only triggers if game is not already won or lost", () => {
    const store = useGameStore();

    // If you've already won, it doesn't change anything
    store.hasWon = true;
    store.hasLost = false;
    store.showResultModal = false;
    store.handleTimeOut();
    expect(store.hasLost).toBe(false);

    // If you've already lost, it doesn't change anything
    store.hasWon = false;
    store.hasLost = true;
    store.showResultModal = false;
    store.handleTimeOut();
    expect(store.showResultModal).toBe(false);

    // If it has neither won nor lost, it does mark as lost and modal agenda.
    store.hasWon = false;
    store.hasLost = false;
    store.showResultModal = false;
    store.handleTimeOut();
    expect(store.hasLost).toBe(true);
  });

  it("saveGameRecord does not call saveRecord if player name is missing", async () => {
    const store = useGameStore();
    const playerStore = usePlayerStore();
    playerStore.name = ""; // Unnamed

    const saveRecordMock = vi.spyOn(
      await import("../../../src/api/backend/records"),
      "saveRecord"
    );

    await (store as any).saveGameRecord();

    expect(saveRecordMock).not.toHaveBeenCalled();
    saveRecordMock.mockRestore();
  });

  it("saveGameRecord calls saveRecord in normal mode and does not evaluate record", async () => {
    const store = useGameStore();
    const playerStore = usePlayerStore();
    playerStore.name = "Legato";
    store.isCountdownMode = false;
    store.milliseconds = 1234;
    store.successCount = 2;
    store.mistakesMade = 1;

    const saveRecordMock = vi
      .spyOn(await import("../../../src/api/backend/records"), "saveRecord")
      .mockResolvedValue(undefined);

    await (store as any).saveGameRecord();

    expect(saveRecordMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Legato",
        time: 1234,
        hits: 2,
        mistakes: 1,
      })
    );
    // No record in normal mode
    expect(store.didBeatRecord).toBe(false);

    saveRecordMock.mockRestore();
  });

  it("saveGameRecord in countdown mode updates didBeatRecord correctly", async () => {
    const store = useGameStore();
    const playerStore = usePlayerStore();
    playerStore.name = "Legato";
    store.isCountdownMode = true;
    store.countdownLimit = 10000;
    store.successCount = 2;
    store.mistakesMade = 1;

    // Case: NO record breaker (timeUsed > targetRecordTime)
    store.targetRecordTime = 5000;
    store.milliseconds = 4000; // timeUsed = 6000 > 5000
    const saveRecordMock = vi
      .spyOn(await import("../../../src/api/backend/records"), "saveRecord")
      .mockResolvedValue(undefined);

    await (store as any).saveGameRecord();
    expect(store.didBeatRecord).toBe(false);

    // Now it DOES break record (timeUsed < targetRecordTime)
    store.targetRecordTime = 7000;
    store.milliseconds = 4000; // timeUsed = 6000 < 7000
    await (store as any).saveGameRecord();
    expect(store.didBeatRecord).toBe(true);

    saveRecordMock.mockRestore();
  });
});
