import { Board, Player, WinResult, Lines, Coordinates } from "@shared/types/index.types";

export function checkWin(board: Board): WinResult {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];

  for (let row = 0; row < Lines.Rows; row++) {
    for (let col = 0; col < Lines.Columns; col++) {
      const currentPlayer = board[row][col].player;
      
      if (currentPlayer === Player.Empty) continue;

      for (const [deltaRow, deltaCol] of directions) {
        const winningPositions: Coordinates[] = [[col, row]];
        
        // Check for 3 more consecutive pieces in this direction
        for (let step = 1; step < 4; step++) {
          const nextRow = row + deltaRow * step;
          const nextCol = col + deltaCol * step;
          
          // Check bounds
          if (nextRow < 0 || nextRow >= Lines.Rows || nextCol < 0 || nextCol >= Lines.Columns) {
            break;
          }
          
          // Check if same player
          if (board[nextRow][nextCol].player !== currentPlayer) {
            break;
          }
          
          winningPositions.push([nextCol, nextRow]);
        }

        // Found a winning line
        if (winningPositions.length === 4) {
          return { 
            who: `player_${currentPlayer}`, 
            positions: winningPositions 
          };
        }
      }
    }
  }

  return null;
};