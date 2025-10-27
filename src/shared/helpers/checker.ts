import { Board, Player, WinResult, Lines, Coordinates } from '@shared/types/index.types';

export function checkWin(board: Board): WinResult {
  const directions: Coordinates[] = [
    [0, 1],   // горизонталь
    [1, 0],   // вертикаль
    [1, 1],   // диагональ ↘
    [1, -1],  // диагональ ↗
  ];
  const { Rows, Columns } = Lines;
  for (let row = 0; row < Rows; row++) {
    for (let col = 0; col < Columns; col++) {
      const currentPlayer = board[row][col].player;
      if (currentPlayer === Player.Empty) continue;
      for (const [dRow, dCol] of directions) {
        const positions: Coordinates[] = [[col, row]];
        for (let step = 1; step < 4; step++) {
          const nextRow = row + dRow * step;
          const nextCol = col + dCol * step;
          if (nextRow < 0 || nextRow >= Rows || nextCol < 0 || nextCol >= Columns) break;
          if (board[nextRow][nextCol].player !== currentPlayer) break;
          positions.push([nextCol, nextRow]);
        }
        if (positions.length === 4) {
          return {
            who: `player_${currentPlayer}`,
            positions,
          };
        }
      }
    }
  }

  return null;
}
