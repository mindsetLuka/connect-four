export enum GameStatus {
  Waiting = 'waiting',
  Pending = 'pending',
  Win = 'win',
  Draw = 'draw'
};

export enum Lines {
  Columns = 7,
  Rows = 6
};

export enum Player {
  Empty = 0,
  First = 1,
  Second = 2
};

export type Step = string;
export type ColumnX = number;
export type RowY = number;
export type Score = number;
export type Coordinates = [ColumnX, RowY];
export type Move = number;
export type Moves = Move[];

export type Cell = {
  player: Player,
  coordinates: Coordinates
};

export type Board = Cell[][];

export type WinResult = {
  who: `player_${Player.First | Player.Second}`;
  positions: Coordinates[];
} | null;

export type ValidatorStep = {
  player_1: Coordinates[];
  player_2: Coordinates[];
  boardState: GameStatus;
  winner?: WinResult;
};

export type ValidatorResult = Record<Step, ValidatorStep>;

export type GameScore = {
  player1: Score;
  player2: Score;
};

export type GameState = {
  moves: Moves;
  currentPlayer: Player;
  gameResult: ValidatorResult;
  gameStatus: GameStatus;
  selectedColumn: ColumnX;
  undoStack: Moves[];
  redoStack: Moves[];
  score: GameScore;
  scoreAwarded: boolean;
};
