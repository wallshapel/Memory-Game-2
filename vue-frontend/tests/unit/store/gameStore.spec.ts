import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { nextTick } from "vue";

// MOCK GLOBAL AUDIO!
globalThis.Audio = vi.fn().mockImplementation(() => ({
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})) as any;

// Pinia y stores reales (NO mockees playerStore aquí)
import { setActivePinia, createPinia } from "pinia";
import { useGameStore } from "../../../src/store/gameStore";
import { usePlayerStore } from "../../../src/store/playerStore";

// Importa tus constantes reales
import {
  CARD_DISPLAY_SETTINGS,
  DELAY_MEMORIZATION_PHASE,
} from "../../../src/constants/assets";

// Mocks solo para dependencias secundarias
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
    vi.useRealTimers(); // Limpiar cualquier fake timer activo
    vi.restoreAllMocks(); // Limpiar todos los mocks
  });

  it("inicializa el juego correctamente", async () => {
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

  it("maneja un click correcto en una carta (primer click)", async () => {
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

  it("no permite click si el juego está ganado o perdido", async () => {
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

  it("al hacer match incrementa successCount y bloquea cartas", async () => {
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

  it("al no hacer match, incrementa mistakesMade y resetea selección", async () => {
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

    // Avanzar el tiempo artificialmente (el timeout para desflipping suele ser 1000ms)
    vi.advanceTimersByTime(1100);

    expect(a.flipped).toBe(false);
    expect(b.flipped).toBe(false);
  });

  it("resetGame resetea correctamente el estado", async () => {
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

  it("clearGame limpia absolutamente todo el estado", async () => {
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

  it("setCountdownMode cambia a modo cuenta regresiva", () => {
    const store = useGameStore();
    store.setCountdownMode(60000, 2, 30000);
    expect(store.isCountdownMode).toBe(true);
    expect(store.countdownLimit).toBe(60000);
    expect(store.initialMistakesAllowed).toBe(2);
    expect(store.targetRecordTime).toBe(30000);
  });

  // ---- TESTS DE maxFails ----
  it("computed maxFails calcula correctamente para EASY", () => {
    setActivePinia(createPinia());
    const playerStore = usePlayerStore();
    playerStore.difficulty = 0;
    playerStore.totalCards = 8;
    const store = useGameStore();
    expect(store.maxFails).toBe(6); // 8/2 + 2
  });

  it("computed maxFails calcula correctamente para MEDIUM", () => {
    setActivePinia(createPinia());
    const playerStore = usePlayerStore();
    playerStore.difficulty = 1;
    playerStore.totalCards = 8;
    const store = useGameStore();
    expect(store.maxFails).toBe(4); // 8/2
  });

  it("computed maxFails calcula correctamente para HARD", () => {
    setActivePinia(createPinia());
    const playerStore = usePlayerStore();
    playerStore.difficulty = 2;
    playerStore.totalCards = 8;
    const store = useGameStore();
    expect(store.maxFails).toBe(2); // 8/2 - 2
  });

  it("initializeGame inicializa y configura cartas correctamente (modo normal)", async () => {
    vi.useFakeTimers();

    setActivePinia(createPinia());
    const store = useGameStore();
    const playerStore = usePlayerStore();
    playerStore.theme = 0;
    playerStore.totalCards = 4;
    playerStore.difficulty = 0; // EASY

    store.isCountdownMode = false;

    // Iniciar el juego (devuelve promesa por fetch)
    const initializationPromise = store.initializeGame();
    await initializationPromise; // Espera fetch de cartas

    // Simula el paso del tiempo de presentación y memorización y animación de flip
    vi.advanceTimersByTime(CARD_DISPLAY_SETTINGS.CARD_PRESENTATION_DELAY_MS); // Presentación (1000ms)
    vi.advanceTimersByTime(DELAY_MEMORIZATION_PHASE.MEMORIZATION_DELAY_EASY); // Memorización (14000ms)
    vi.advanceTimersByTime(CARD_DISPLAY_SETTINGS.CARD_FLIP_ANIMATION_MS); // Flip final (590ms)

    // Ahora sí puedes hacer los asserts:
    expect(store.cards.length).toBe(4);

    store.cards.forEach((card) => {
      expect(card.blocked).toBe(false);
      expect(card.flipped).toBe(false);
    });
    expect(store.cardsAreReady).toBe(true);

    vi.useRealTimers();
  });

  it("initializeGame no hace nada si el theme seleccionado no tiene fetcher", async () => {
    const store = useGameStore();
    const playerStore = usePlayerStore();
    playerStore.theme = 99; // theme inválido
    playerStore.totalCards = 4;

    // Opcional: espiar console.error para afirmar que ocurre el error
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await store.initializeGame();

    expect(store.cards.length).toBe(0); // No hay cartas
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error fetching cards:"),
      expect.objectContaining({
        message: expect.stringContaining("No fetcher available"),
      })
    );
    errorSpy.mockRestore();
  });

  it("initializeGame no hace nada si el fetcher lanza un error", async () => {
    // Guardamos el fetcher original
    const { themeFetchers } = await import("../../../src/api/themeFetchers");
    const originalFetcher = themeFetchers[0];
    themeFetchers[0] = vi.fn(async () => {
      throw new Error("¡Falló el fetch!");
    });

    const store = useGameStore();
    const playerStore = usePlayerStore();
    playerStore.theme = 0;
    playerStore.totalCards = 4;

    // Espiar el error
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await store.initializeGame();

    expect(store.cards.length).toBe(0);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error fetching cards:"),
      expect.objectContaining({ message: "¡Falló el fetch!" })
    );

    // Restauramos fetcher original
    themeFetchers[0] = originalFetcher;
    errorSpy.mockRestore();
  });

  it("resetGame deja failCount según el modo: 0 en normal, initialMistakesAllowed en countdown", async () => {
    // Modo normal
    const store = useGameStore();
    store.isCountdownMode = false;
    // Ponerlo en cualquier valor diferente de 0 para probar el reset
    store.failCount = 42;

    await store.resetGame();
    expect(store.failCount).toBe(0);

    // Modo countdown
    store.isCountdownMode = true;
    store.initialMistakesAllowed = 7;
    // Ponemos cualquier valor primero
    store.failCount = 1;

    await store.resetGame();
    expect(store.failCount).toBe(7);
  });

  it("handleCardClick ignora clicks si la carta está volteada, bloqueada o ya hay secondCard", async () => {
    const store = useGameStore();
    const playerStore = usePlayerStore();
    playerStore.theme = 0;
    playerStore.totalCards = 4;
    await store.initializeGame();

    // Simular cartas desbloqueadas y no volteadas
    store.cards.forEach((card) => {
      card.flipped = false;
      card.blocked = false;
    });

    const card = store.cards[0];

    // 1. Si ya está flipped
    card.flipped = true;
    store.handleCardClick(card);
    expect(store.firstCard).toBe(null);

    // 2. Si está bloqueada
    card.flipped = false;
    card.blocked = true;
    store.handleCardClick(card);
    expect(store.firstCard).toBe(null);

    // 3. Si ya hay secondCard
    card.blocked = false;
    store.secondCard = store.cards[1];
    store.handleCardClick(card);
    expect(card.flipped).toBe(false);
  });

  it("checkMatch no hace nada si firstCard o secondCard son null", () => {
    const store = useGameStore();

    // Caso 1: ambos null
    store.firstCard = null;
    store.secondCard = null;
    expect(() => store.checkMatch()).not.toThrow();

    // Caso 2: solo firstCard presente
    store.firstCard = { name: "A" } as any;
    store.secondCard = null;
    expect(() => store.checkMatch()).not.toThrow();

    // Caso 3: solo secondCard presente
    store.firstCard = null;
    store.secondCard = { name: "A" } as any;
    expect(() => store.checkMatch()).not.toThrow();

    // Opcional: verifica que no cambia successCount ni mistakesMade
    expect(store.successCount).toBe(0);
    expect(store.mistakesMade).toBe(0);
  });

  it("watcher de failCount: pierde y muestra el modal si se alcanzan los fallos permitidos en modo normal", async () => {
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

  it("watcher de failCount: pierde y muestra el modal si failCount < 0 en modo countdown", async () => {
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

  it("startChronometer no crea múltiples intervalos si ya está activo", () => {
    const store = useGameStore();
    store.isCountdownMode = false;

    // Llama dos veces
    store.startChronometer();
    const currentInterval = (store as any).interval;
    store.startChronometer();
    expect((store as any).interval).toBe(currentInterval);

    store.stopChronometer(); // Limpieza
  });

  it("stopChronometer no falla si no hay intervalo activo", () => {
    const store = useGameStore();
    // No hay intervalo
    expect(() => store.stopChronometer()).not.toThrow();
  });

  it("resetChronometer pone los milisegundos en 0 o countdownLimit según el modo", () => {
    const store = useGameStore();

    // Modo normal
    store.isCountdownMode = false;
    store.milliseconds = 999;
    store.resetChronometer();
    expect(store.milliseconds).toBe(0);

    // Modo countdown
    store.isCountdownMode = true;
    store.countdownLimit = 12345;
    store.milliseconds = 5;
    store.resetChronometer();
    expect(store.milliseconds).toBe(12345);

    store.stopChronometer(); // Limpieza
  });

  it("handleTimeOut solo hace efecto si el juego no está ganado ni perdido", () => {
    const store = useGameStore();

    // Si ya ganó, no cambia nada
    store.hasWon = true;
    store.hasLost = false;
    store.showResultModal = false;
    store.handleTimeOut();
    expect(store.hasLost).toBe(false);

    // Si ya perdió, tampoco cambia nada
    store.hasWon = false;
    store.hasLost = true;
    store.showResultModal = false;
    store.handleTimeOut();
    expect(store.showResultModal).toBe(false);

    // Si no ha ganado ni perdido, sí marca como perdido y agenda modal
    store.hasWon = false;
    store.hasLost = false;
    store.showResultModal = false;
    store.handleTimeOut();
    expect(store.hasLost).toBe(true);
  });

  it("saveGameRecord no llama a saveRecord si no hay nombre de jugador", async () => {
    const store = useGameStore();
    const playerStore = usePlayerStore();
    playerStore.name = ""; // Sin nombre

    const saveRecordMock = vi.spyOn(
      await import("../../../src/api/backend/records"),
      "saveRecord"
    );

    await (store as any).saveGameRecord();

    expect(saveRecordMock).not.toHaveBeenCalled();
    saveRecordMock.mockRestore();
  });

  it("saveGameRecord llama a saveRecord en modo normal y no evalúa récord", async () => {
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
    // En modo normal no hay récord
    expect(store.didBeatRecord).toBe(false);

    saveRecordMock.mockRestore();
  });

  it("saveGameRecord en modo countdown actualiza didBeatRecord correctamente", async () => {
    const store = useGameStore();
    const playerStore = usePlayerStore();
    playerStore.name = "Legato";
    store.isCountdownMode = true;
    store.countdownLimit = 10000;
    store.successCount = 2;
    store.mistakesMade = 1;

    // Caso: NO bate récord (timeUsed > targetRecordTime)
    store.targetRecordTime = 5000;
    store.milliseconds = 4000; // timeUsed = 6000 > 5000
    const saveRecordMock = vi
      .spyOn(await import("../../../src/api/backend/records"), "saveRecord")
      .mockResolvedValue(undefined);

    await (store as any).saveGameRecord();
    expect(store.didBeatRecord).toBe(false);

    // Ahora SÍ bate récord (timeUsed < targetRecordTime)
    store.targetRecordTime = 7000;
    store.milliseconds = 4000; // timeUsed = 6000 < 7000
    await (store as any).saveGameRecord();
    expect(store.didBeatRecord).toBe(true);

    saveRecordMock.mockRestore();
  });
});
