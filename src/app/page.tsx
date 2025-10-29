'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Player, GameStatus, Moves, ValidatorResult, GameScore, ColumnX } from '@/shared/types/index.types';
import { saveGameState, loadGameState, saveScore, loadScore, clearGameState } from '@/shared/helpers/storage';
import { validator } from '@/shared/helpers/validator';
import chooseBotMove from '@/shared/helpers/bot';
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
  const [playVsBot, setPlayVsBot] = useState(false);
  const [botPaused, setBotPaused] = useState(false);

  const selectedColumnRef = useRef<ColumnX>(0);
  const gameStatusRef = useRef<GameStatus>(GameStatus.Waiting);

  useEffect(() => {
    selectedColumnRef.current = selectedColumn;
  }, [selectedColumn]);
  useEffect(() => {
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);

  const applyMovesState = useCallback((nextMoves: Moves) => {
    const res = validator(nextMoves);
    const stepKey = `step_${nextMoves.length}` as const;
    const step = res[stepKey];

    setGameResult(res);
    if (step) {
      if (nextMoves.length === 0 && step.boardState === GameStatus.Waiting) {
        setGameStatus(GameStatus.Pending);
      } else {
        setGameStatus(step.boardState);
      }
      setCurrentPlayer(nextMoves.length % 2 === 0 ? Player.First : Player.Second);
    }
  }, []);

  const currentStep = useMemo(() => {
    if (!gameResult) return null;
    return gameResult[`step_${moves.length}`];
  }, [gameResult, moves.length]);

  useEffect(() => {
    const savedScore = loadScore();
    setScore(savedScore);
    const s = loadGameState();
    if (!s) return;
    setMoves(s.moves ?? []);
    setCurrentPlayer(s.currentPlayer ?? Player.First);
    setGameResult(s.gameResult ?? {});
    setGameStatus(s.gameStatus ?? GameStatus.Waiting);
    setSelectedColumn(s.selectedColumn ?? 0);
    setUndoStack(s.undoStack ?? []);
    setRedoStack(s.redoStack ?? []);
    setScoreAwarded(Boolean(s.scoreAwarded));
  }, []);

  useEffect(() => {
    saveGameState({
      moves,
      currentPlayer,
      gameResult,
      gameStatus,
      selectedColumn,
      undoStack,
      redoStack,
      score,
      scoreAwarded,
    });
  }, [moves, currentPlayer, gameResult, gameStatus, selectedColumn, undoStack, redoStack, score, scoreAwarded]);

  const makeMove = useCallback((columnIndex: ColumnX) => {
    if (gameStatusRef.current === GameStatus.Win || gameStatusRef.current === GameStatus.Draw) return;
    const testMoves = [...moves, columnIndex] as Moves;
    const testResult = validator(testMoves);
    const stepKey = `step_${testMoves.length}` as const;
    const stepResult = testResult[stepKey];
    if (!stepResult) return;
    setUndoStack(prev => [...prev, moves]);
    setRedoStack([]);
    setMoves(testMoves);
    setGameResult(testResult);
    setGameStatus(stepResult.boardState);
    if (stepResult.boardState === GameStatus.Pending) {
      setCurrentPlayer(prev => (prev === Player.First ? Player.Second : Player.First));
    }
  }, [moves]);

  useEffect(() => {
    if (!scoreAwarded && gameStatus === GameStatus.Win && currentStep?.winner) {
      const winnerPlayer = currentStep.winner.who === 'player_1' ? Player.First : Player.Second;
      setScore(prev => {
        const next = {
          player1: winnerPlayer === Player.First ? prev.player1 + 1 : prev.player1,
          player2: winnerPlayer === Player.Second ? prev.player2 + 1 : prev.player2,
        };
        saveScore(next);
        return next;
      });
      setScoreAwarded(true);
    }
  }, [gameStatus, currentStep, scoreAwarded]);

  const handleColumnClick = useCallback((col: ColumnX) => {
    if (playVsBot) setBotPaused(false);
    makeMove(col);
  }, [makeMove, playVsBot]);
  const handleColumnHover = useCallback((col: ColumnX) => {
    if (gameStatusRef.current === GameStatus.Win || gameStatusRef.current === GameStatus.Draw) return;
    setSelectedColumn(col);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const status = gameStatusRef.current;
      if (status === GameStatus.Win || status === GameStatus.Draw) return;
      const clamp = (n: number) => (n < 0 ? 0 : n > 6 ? 6 : n);
      switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        setSelectedColumn(prev => clamp(prev - 1) as ColumnX);
        break;
      case 'ArrowRight':
        e.preventDefault();
        setSelectedColumn(prev => clamp(prev + 1) as ColumnX);
        break;
      case 'Enter':
        e.preventDefault();
        if (playVsBot && currentPlayer === Player.Second) return;
        makeMove(selectedColumnRef.current);
        break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [makeMove, currentPlayer, playVsBot]);

  useEffect(() => {
    if (!playVsBot) return;
    if (gameStatusRef.current === GameStatus.Win || gameStatusRef.current === GameStatus.Draw) return;
    if (botPaused) return;
    if (currentPlayer !== Player.Second) return;
    const timer = setTimeout(() => {
      const col = chooseBotMove(moves, Player.Second);
      if (typeof col === 'number') makeMove(col);
    }, 350);

    return () => clearTimeout(timer);
  }, [moves, playVsBot, currentPlayer, gameStatus, makeMove, botPaused]);

  const undoMove = useCallback(() => {
    if (undoStack.length === 0) return;
    const previousMoves = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, moves]);
    setMoves(previousMoves);
    setUndoStack(prev => prev.slice(0, -1));
    applyMovesState(previousMoves);
    if (playVsBot) setBotPaused(true);
  }, [undoStack, moves, applyMovesState, playVsBot]);

  const redoMove = useCallback(() => {
    if (redoStack.length === 0) return;
    const nextMoves = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, moves]);
    setMoves(nextMoves);
    setRedoStack(prev => prev.slice(0, -1));
    applyMovesState(nextMoves);
    if (playVsBot && redoStack.length === 1) setBotPaused(false);
  }, [redoStack, moves, applyMovesState, playVsBot]);

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
    setBotPaused(false);
  }, []);

  const resetScore = useCallback(() => {
    const zero = { player1: 0, player2: 0 };
    setScore(zero);
    saveScore(zero);
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
          onColumnClick={(col) => {
            if (playVsBot && currentPlayer === Player.Second) return;
            handleColumnClick(col);
          }}
          onColumnHover={handleColumnHover}
        />
        <GameControls
          undoMove={undoMove}
          redoMove={redoMove}
          resetGame={resetGame}
          resetScore={resetScore}
          undoDisabled={undoStack.length === 0}
          redoDisabled={redoStack.length === 0}
          playVsBot={playVsBot}
          setPlayVsBot={setPlayVsBot}
          gameStatus={gameStatus}
        />
      </section>
    </main>
  );
}
