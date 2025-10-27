import { Board, Player, GameStatus, WinResult, Moves, ValidatorResult } from '@/shared/types/index.types';
import { createEmptyBoard, dropPiece, isBoardFull } from '@shared/helpers/board';
import { getPlayerPositions } from '@shared/helpers/positions';
import { checkWin } from '@shared/helpers/checker';

export function validator(moves: Moves): ValidatorResult {
  const result: ValidatorResult = {};
  let board: Board = createEmptyBoard();
  let currentPlayer: Player = Player.First;
  let gameStatus: GameStatus = GameStatus.Waiting;
  let winnerInfo: WinResult = null;

  result['step_0'] = {
    player_1: getPlayerPositions(board, Player.First),
    player_2: getPlayerPositions(board, Player.Second),
    boardState: gameStatus,
  };

  for (let i = 0; i < moves.length; i++) {
    const col = moves[i];

    if (gameStatus === GameStatus.Win || gameStatus === GameStatus.Draw) {
      break;
    }

    if (i === 0) {
      gameStatus = GameStatus.Pending;
    }

    const boardCopy = board.map(row => row.slice());

    const placed = dropPiece(boardCopy, col, currentPlayer);
    if (!placed) {
      currentPlayer = currentPlayer === Player.First ? Player.Second : Player.First;
      continue;
    }

    board = boardCopy;
    winnerInfo = checkWin(board);
    if (winnerInfo) {
      gameStatus = GameStatus.Win;
    } else if (isBoardFull(board)) {
      gameStatus = GameStatus.Draw;
    }

    result[`step_${i + 1}`] = {
      player_1: getPlayerPositions(board, Player.First),
      player_2: getPlayerPositions(board, Player.Second),
      boardState: gameStatus,
      ...(winnerInfo && { winner: winnerInfo }),
    };

    if (gameStatus === GameStatus.Pending) {
      currentPlayer = currentPlayer === Player.First ? Player.Second : Player.First;
    }
  }

  return result;
}
