import { GameState, GameScore } from '@/shared/types/index.types';

const STORAGE_KEYS = {
  GAME_STATE: 'connect-four-game-state',
  SCORE: 'connect-four-score',
} as const;

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(error);
  }
}

function loadFromStorage<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function saveGameState(gameState: Partial<GameState>): void {
  saveToStorage(STORAGE_KEYS.GAME_STATE, gameState);
}

export function loadGameState(): Partial<GameState> | null {
  const state = loadFromStorage<Partial<GameState>>(STORAGE_KEYS.GAME_STATE);
  return typeof state === 'object' && state !== null ? state : null;
}

export function clearGameState(): void {
  localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
}

const DEFAULT_SCORE: GameScore = { player1: 0, player2: 0 };

export function saveScore(score: GameScore): void {
  saveToStorage(STORAGE_KEYS.SCORE, score);
}

export function loadScore(): GameScore {
  const parsed = loadFromStorage<GameScore>(STORAGE_KEYS.SCORE);

  if (
    !parsed ||
    typeof parsed.player1 !== 'number' ||
    typeof parsed.player2 !== 'number'
  ) {
    return { ...DEFAULT_SCORE };
  }

  return {
    player1: Math.max(0, parsed.player1),
    player2: Math.max(0, parsed.player2),
  };
}

export function clearScore(): void {
  localStorage.removeItem(STORAGE_KEYS.SCORE);
}
