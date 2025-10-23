import { Board, Player, Lines } from "@shared/types/index.types";

export function createEmptyBoard(): Board {
  return Array.from({ length: Lines.Rows }, (_, rowIndex) => 
    Array.from({ length: Lines.Columns }, (_, colIndex) => ({
      player: Player.Empty,
      coordinates: [colIndex, Lines.Rows - 1 - rowIndex]
    }))
  );
};

export function dropPiece(board: Board, col: number, player: Player): { row: number } | null {
  if (col < 0 || col >=  Lines.Columns) return null;
  // find lowest empty row in this column
  for (let row = Lines.Rows - 1; row >= 0; row--) {
    if (board[row][col].player === Player.Empty) {
      board[row][col] = {
        player: player,
        coordinates: [col, row]
      };
      return { row: row };
    }
  }
  return null; // column full
};

export function isBoardFull(board: Board): boolean {
  for (let col = 0; col < Lines.Columns; col++) {
    if (board[0][col].player === Player.Empty){
      return false;
    } 
  }
  return true;
};
