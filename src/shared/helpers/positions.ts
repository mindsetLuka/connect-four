import { Board, Player, Coordinates, Lines } from "@shared/types/index.types";

export function getPlayerPositions(board: Board, player: Player): Coordinates[] {
    const positions: Coordinates[] = [];
    
    for (let r = 0; r < Lines.Rows; r++) {
      for (let c = 0; c < Lines.Columns; c++) {
        if (board[r][c].player === player) {
          positions.push([c, r]);
        }
      }
    }
    
    return positions;
}