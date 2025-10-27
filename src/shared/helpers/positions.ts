import { Board, Player, Coordinates, Lines } from '@shared/types/index.types';

export function getPlayerPositions(board: Board, player: Player): Coordinates[] {
  const { Rows, Columns } = Lines;
  const positions: Coordinates[] = [];
  for (let row = 0; row < Rows; row++) {
    const currentRow = board[row];
    for (let col = 0; col < Columns; col++) {
      if (currentRow[col].player === player) {
        positions.push([col, row]);
      }
    }
  }

  return positions;
}
