import { createEmptyBoard, dropPiece } from '@shared/helpers/board';
import { checkWin } from '@shared/helpers/checker';
import { Lines, Moves, Player, ColumnX } from '@shared/types/index.types';

export default function chooseBotMove(moves: Moves, botPlayer: Player): ColumnX | null {
  const { Columns } = Lines;
  const board = createEmptyBoard();
  let current: Player = Player.First;
  for (const m of moves) {
    dropPiece(board, m, current);
    current = current === Player.First ? Player.Second : Player.First;
  }

  const opponent = botPlayer === Player.First ? Player.Second : Player.First;

  for (let col = 0; col < Columns; col++) {
    const test = board.map(row => row.map(cell => ({ ...cell })));
    const placed = dropPiece(test, col as ColumnX, botPlayer);
    if (!placed) continue;
    if (checkWin(test)) return col as ColumnX;
  }

  for (let col = 0; col < Columns; col++) {
    const test = board.map(row => row.map(cell => ({ ...cell })));
    const placed = dropPiece(test, col as ColumnX, opponent);
    if (!placed) continue;
    if (checkWin(test)) return col as ColumnX;
  }

  const valid: ColumnX[] = [];
  for (let col = 0; col < Columns; col++) {
    if (board[0][col].player === Player.Empty) valid.push(col as ColumnX);
  }
  if (valid.length === 0) return null;
  return valid[Math.floor(Math.random() * valid.length)];
}
