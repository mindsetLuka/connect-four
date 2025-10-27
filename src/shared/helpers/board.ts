import { Board, Player, Lines, ColumnX, RowY } from '@shared/types/index.types';

export function createEmptyBoard(): Board {
  const { Rows, Columns } = Lines;
  return Array.from({ length: Rows }, (_, rowIndex) =>
    Array.from({ length: Columns }, (_, colIndex) => ({
      player: Player.Empty,
      coordinates: [colIndex, Rows - 1 - rowIndex] as [ColumnX, RowY],
    })),
  );
}

export function dropPiece(
  board: Board,
  col: ColumnX,
  player: Player,
): { row: RowY } | null {
  const { Rows, Columns } = Lines;
  if (col < 0 || col >= Columns) return null;
  for (let row = Rows - 1; row >= 0; row--) {
    const cell = board[row][col];
    if (cell.player === Player.Empty) {
      cell.player = player;
      cell.coordinates = [col, row];
      return { row };
    }
  }

  return null;
}

export function isBoardFull(board: Board): boolean {
  return board[0].every(cell => cell.player !== Player.Empty);
}
