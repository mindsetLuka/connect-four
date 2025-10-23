import { Board, Player, GameStatus, WinResult, Lines, Coordinates, Moves, ValidatorResult } from '@/shared/types/index.types';
import { createEmptyBoard, dropPiece, isBoardFull } from './board';
import { getPlayerPositions } from './positions';
import { checkWin } from './checker';


export function validator(moves: Moves): ValidatorResult {
  const result: ValidatorResult = {};
  let board: Board = createEmptyBoard();
  let currentPlayer: Player = Player.First;
  let gameStatus: GameStatus = GameStatus.Waiting;
  let winnerInfo: WinResult = null;

  // Initial state (step_0)
  result[`step_0`] = {
    player_1: getPlayerPositions(board, Player.First),
    player_2: getPlayerPositions(board, Player.Second),
    boardState: gameStatus
  };

  // Process each move
  for (let i = 0; i < moves.length; i++) {
    const col = moves[i];
    
    // Skip if game already ended
    if (gameStatus === GameStatus.Win || gameStatus === GameStatus.Draw) {
      break;
    }

    // Update game status to pending when first move is made
    if (i === 0) {
      gameStatus = GameStatus.Pending;
    }

    // Create a copy of the board for this move
    const boardCopy = board.map(row => row.slice());
    
    // Drop the piece
    const placed = dropPiece(boardCopy, col, currentPlayer);
    if (!placed) {
      // Invalid move (column full) - skip this move but continue with next
      currentPlayer = currentPlayer === Player.First ? Player.Second : Player.First;
      continue;
    }

    // Update the actual board
    board = boardCopy;

    // Check for win
    winnerInfo = checkWin(board);
    if (winnerInfo) {
      gameStatus = GameStatus.Win;
    } else if (isBoardFull(board)) {
      gameStatus = GameStatus.Draw;
    }

    // Add step result
    result[`step_${i + 1}`] = {
      player_1: getPlayerPositions(board, Player.First),
      player_2: getPlayerPositions(board, Player.Second),
      boardState: gameStatus,
      ...(winnerInfo && { winner: winnerInfo })
    };

    // Switch player for next move (only if game is still pending)
    if (gameStatus === GameStatus.Pending) {
      currentPlayer = currentPlayer === Player.First ? Player.Second : Player.First;
    }
  }

  return result;
};
