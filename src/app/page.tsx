'use client';

import { useState, useCallback, useEffect } from 'react';
import { Player, GameStatus, Moves, ValidatorResult, GameScore, ColumnX } from '@/shared/types/index.types';
import { saveGameState, loadGameState, saveScore, loadScore, clearGameState } from '@/shared/helpers/storage';
import { validator } from '@/shared/helpers/validator';

import GameStatusBar from '@/components/gameStatusBar/gameStatusBar';
import GameScoreboard from '@/components/gameScoreboard/gameScoreboard';
import GameBoard from '@/components/gameBoard/gameBoard';
import GameControls from '@/components/gameControls/gameControls';

export default function ConnectFour() {
  const [moves, setMoves] = useState<Moves>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.First);
  const [gameResult, setGameResult] = useState<ValidatorResult>({});
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Waiting);
  const [selectedColumn, setSelectedColumn] = useState<ColumnX>(0);
  const [undoStack, setUndoStack] = useState<Moves[]>([]);
  const [redoStack, setRedoStack] = useState<Moves[]>([]);
  const [score, setScore] = useState<GameScore>({ player1: 0, player2: 0 });
  const [scoreAwarded, setScoreAwarded] = useState(false);

  const currentStep = gameResult ? gameResult[`step_${moves.length}`] : null;

  useEffect(() => {
    const savedScore = loadScore();
    setScore(savedScore);

    const savedState = loadGameState();
    if (savedState) {
      if (savedState.moves) setMoves(savedState.moves);
      if (savedState.currentPlayer !== undefined) setCurrentPlayer(savedState.currentPlayer);
      if (savedState.gameResult) setGameResult(savedState.gameResult);
      if (savedState.gameStatus) setGameStatus(savedState.gameStatus);
      if (savedState.selectedColumn !== undefined) setSelectedColumn(savedState.selectedColumn);
      if (savedState.undoStack) setUndoStack(savedState.undoStack);
      if (savedState.redoStack) setRedoStack(savedState.redoStack);
      if (savedState.scoreAwarded !== undefined) setScoreAwarded(savedState.scoreAwarded);
    }
  }, []);

  const makeMove = useCallback((columnIndex: ColumnX) => {
    if (gameStatus === GameStatus.Win || gameStatus === GameStatus.Draw) return;

    const testMoves = [...moves, columnIndex];
    const testResult = validator(testMoves);
    const stepKey = `step_${testMoves.length}`;
    const stepResult = testResult[stepKey];
    if (!stepResult) return;

    setUndoStack(prev => [...prev, moves]);
    setRedoStack([]);
    setMoves(testMoves);
    setGameResult(testResult);
    setGameStatus(stepResult.boardState);

    if (stepResult.boardState === GameStatus.Pending) {
      setCurrentPlayer(currentPlayer === Player.First ? Player.Second : Player.First);
    }
  }, [moves, currentPlayer, gameStatus]);

  useEffect(() => {
    const gameState = {
      moves,
      currentPlayer,
      gameResult,
      gameStatus,
      selectedColumn,
      undoStack,
      redoStack,
      score,
      scoreAwarded,
    };
    saveGameState(gameState);
  }, [moves, currentPlayer, gameResult, gameStatus, selectedColumn, undoStack, redoStack, score, scoreAwarded]);

  useEffect(() => {
    if (!scoreAwarded && gameStatus === GameStatus.Win && currentStep?.winner) {
      const winnerPlayer = currentStep.winner.who === 'player_1' ? Player.First : Player.Second;
      setScore(prevScore => {
        const newScore = {
          player1: winnerPlayer === Player.First ? prevScore.player1 + 1 : prevScore.player1,
          player2: winnerPlayer === Player.Second ? prevScore.player2 + 1 : prevScore.player2,
        };
        saveScore(newScore);
        return newScore;
      });
      setScoreAwarded(true);
    }
  }, [gameStatus, currentStep, scoreAwarded]);

  const handleColumnClick = useCallback((col: ColumnX) => makeMove(col), [makeMove]);

  const handleColumnHover = useCallback((col: ColumnX) => {
    if (gameStatus === GameStatus.Win || gameStatus === GameStatus.Draw) return;
    setSelectedColumn(col);
  }, [gameStatus]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus === GameStatus.Win || gameStatus === GameStatus.Draw) return;

      switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        setSelectedColumn(prev => Math.max(0, prev - 1));
        break;
      case 'ArrowRight':
        e.preventDefault();
        setSelectedColumn(prev => Math.min(6, prev + 1));
        break;
      case 'Enter':
        e.preventDefault();
        makeMove(selectedColumn);
        break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedColumn, makeMove, gameStatus]);

  const undoMove = useCallback(() => {
    if (undoStack.length === 0) return;
    const previousMoves = undoStack[undoStack.length - 1];
    const currentMoves = moves;
    setRedoStack(prev => [...prev, currentMoves]);
    setMoves(previousMoves);
    setUndoStack(prev => prev.slice(0, -1));
    const newResult = validator(previousMoves);
    setGameResult(newResult);
    const stepKey = `step_${previousMoves.length}`;
    const stepResult = newResult[stepKey];
    if (stepResult) {
      setGameStatus(stepResult.boardState);
      setCurrentPlayer(previousMoves.length % 2 === 0 ? Player.First : Player.Second);
    }
  }, [undoStack, moves]);

  const redoMove = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextMoves = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, moves]);
    setMoves(nextMoves);
    setRedoStack(prev => prev.slice(0, -1));
    const newResult = validator(nextMoves);
    setGameResult(newResult);
    const stepKey = `step_${nextMoves.length}`;
    const stepResult = newResult[stepKey];
    if (stepResult) {
      setGameStatus(stepResult.boardState);
      setCurrentPlayer(nextMoves.length % 2 === 0 ? Player.First : Player.Second);
    }
  }, [redoStack, moves]);

  const resetGame = useCallback(() => {
    setMoves([]);
    setCurrentPlayer(Player.First);
    setGameResult({});
    setGameStatus(GameStatus.Waiting);
    setSelectedColumn(0);
    setUndoStack([]);
    setRedoStack([]);
    setScoreAwarded(false);
    clearGameState();
  }, []);

  const resetScore = useCallback(() => {
    setScore({ player1: 0, player2: 0 });
    saveScore({ player1: 0, player2: 0 });
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-2 bg-cover bg-center bg-fixed bg-[url('../../public/back-tochka.png')]">
      <section className="w-full max-w-md p-4 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl flex flex-col">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-3 text-white">4 в ряд</h1>

        <GameStatusBar gameStatus={gameStatus} currentStep={currentStep} currentPlayer={currentPlayer} />
        <GameScoreboard score={score} />
        <GameBoard
          gameStatus={gameStatus}
          currentStep={currentStep}
          selectedColumn={selectedColumn}
          onColumnClick={handleColumnClick}
          onColumnHover={handleColumnHover}
        />
        <GameControls
          undoMove={undoMove}
          redoMove={redoMove}
          resetGame={resetGame}
          resetScore={resetScore}
          undoDisabled={undoStack.length === 0}
          redoDisabled={redoStack.length === 0}
        />
      </section>
    </main>
  );
}
