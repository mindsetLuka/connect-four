import { Board, Player, GameStatus, WinResult, Moves, ValidatorResult } from '@/shared/types/index.types';
import { createEmptyBoard, dropPiece, isBoardFull } from '@shared/helpers/board';
import { getPlayerPositions } from '@shared/helpers/positions';
import { checkWin } from '@shared/helpers/checker';

function nextPlayer(player: Player): Player {
  return player === Player.First ? Player.Second : Player.First;
}

export function validator(moves: Moves): ValidatorResult {
  const result: ValidatorResult = {};
  let board: Board = createEmptyBoard();
  let currentPlayer: Player = Player.First;
  let status: GameStatus = GameStatus.Waiting;
  let winnerInfo: WinResult = null;
  result['step_0'] = {
    player_1: getPlayerPositions(board, Player.First),
    player_2: getPlayerPositions(board, Player.Second),
    boardState: status,
  };

  for (let i = 0; i < moves.length; i++) {
    const col = moves[i];
    if (status === GameStatus.Win || status === GameStatus.Draw) break;
    if (i === 0) status = GameStatus.Pending;
    const newBoard = board.map(row => [...row]);
    const placed = dropPiece(newBoard, col, currentPlayer);
    if (!placed) {
      currentPlayer = nextPlayer(currentPlayer);
      continue;
    }
    board = newBoard;
    winnerInfo = checkWin(board);
    if (winnerInfo) {
      status = GameStatus.Win;
    } else if (isBoardFull(board)) {
      status = GameStatus.Draw;
    }
    result[`step_${i + 1}`] = {
      player_1: getPlayerPositions(board, Player.First),
      player_2: getPlayerPositions(board, Player.Second),
      boardState: status,
      ...(winnerInfo ? { winner: winnerInfo } : {}),
    };
    if (status === GameStatus.Pending) {
      currentPlayer = nextPlayer(currentPlayer);
    }
  }

  return result;
}
