import { GameState, GameScore, Player, GameStatus } from '@/shared/types/index.types';

const STORAGE_KEYS = {
  GAME_STATE: 'connect-four-game-state',
  SCORE: 'connect-four-score'
} as const;

export function saveGameState(gameState: Partial<GameState>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(gameState));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}

export function loadGameState(): Partial<GameState> | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    if (!saved) return null;
    
    const parsed = JSON.parse(saved);
    
    // Валидация загруженных данных
    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

export function saveScore(score: GameScore): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SCORE, JSON.stringify(score));
  } catch (error) {
    console.error('Failed to save score:', error);
  }
}

export function loadScore(): GameScore {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SCORE);
    if (!saved) return { player1: 0, player2: 0 };
    
    const parsed = JSON.parse(saved);
    
    // Валидация загруженных данных
    if (typeof parsed !== 'object' || parsed === null) {
      return { player1: 0, player2: 0 };
    }
    
    if (typeof parsed.player1 !== 'number' || typeof parsed.player2 !== 'number') {
      return { player1: 0, player2: 0 };
    }
    
    return {
      player1: Math.max(0, parsed.player1),
      player2: Math.max(0, parsed.player2)
    };
  } catch (error) {
    console.error('Failed to load score:', error);
    return { player1: 0, player2: 0 };
  }
}

export function clearGameState(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
}

export function clearScore(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SCORE);
  } catch (error) {
    console.error('Failed to clear score:', error);
  }
}
