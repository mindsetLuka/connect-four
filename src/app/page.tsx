'use client';

import { ArrowDown } from '@geist-ui/icons';
import { useState, useCallback, useEffect } from 'react';
import { Player, GameStatus, Moves, ValidatorResult, GameScore, Lines } from '@/shared/types/index.types';
import { validator } from '@/shared/helpers/validator';
import { saveGameState, loadGameState, saveScore, loadScore, clearGameState } from '@/shared/helpers/storage';

export default function ConnectFour() {
  const [moves, setMoves] = useState<Moves>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.First);
  const [gameResult, setGameResult] = useState<ValidatorResult>({});
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Waiting);
  const [selectedColumn, setSelectedColumn] = useState<number>(0);
  
  // Состояния для отмены/возобновления ходов
  const [undoStack, setUndoStack] = useState<Moves[]>([]);
  const [redoStack, setRedoStack] = useState<Moves[]>([]);
  
  // Состояние для счета
  const [score, setScore] = useState<GameScore>({ player1: 0, player2: 0 });

  // Получаем текущее состояние игры через валидатор
  const currentStep = gameResult ? gameResult[`step_${moves.length}`] : null;

  // Загрузка состояния при инициализации
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
    }
  }, []);

  const makeMove = useCallback((columnIndex: number) => {
    // Не делаем ход если игра завершена
    if (gameStatus === GameStatus.Win || gameStatus === GameStatus.Draw) {
      return;
    }

    // Сначала проверяем, можно ли сделать ход
    const testMoves = [...moves, columnIndex];
    const testResult = validator(testMoves);
    const stepKey = `step_${testMoves.length}`;
    const stepResult = testResult[stepKey];

    // Если шаг не создался (колонка заполнена), не делаем ход
    if (!stepResult) {
      return;
    }

    // Сохраняем текущее состояние для отмены
    setUndoStack(prev => [...prev, moves]);
    // Очищаем стек возобновления при новом ходе
    setRedoStack([]);

    // Добавляем новый ход только если он валидный
    setMoves(testMoves);
    setGameResult(testResult);
    setGameStatus(stepResult.boardState);

    // Переключаем игрока только если игра продолжается
    if (stepResult.boardState === GameStatus.Pending) {
      setCurrentPlayer(currentPlayer === Player.First ? Player.Second : Player.First);
    }
  }, [moves, currentPlayer, gameStatus]);

  // Сохранение состояния игры при изменении
  useEffect(() => {
    const gameState = {
      moves,
      currentPlayer,
      gameResult,
      gameStatus,
      selectedColumn,
      undoStack,
      redoStack,
      score
    };
    saveGameState(gameState);
  }, [moves, currentPlayer, gameResult, gameStatus, selectedColumn, undoStack, redoStack, score]);

  // Обновление счета при победе
  useEffect(() => {
    if (gameStatus === GameStatus.Win && currentStep?.winner) {
      const winnerPlayer = currentStep.winner.who === 'player_1' ? Player.First : Player.Second;
      setScore(prevScore => {
        const newScore = {
          player1: winnerPlayer === Player.First ? prevScore.player1 + 1 : prevScore.player1,
          player2: winnerPlayer === Player.Second ? prevScore.player2 + 1 : prevScore.player2
        };
        saveScore(newScore);
        return newScore;
      });
    }
  }, [gameStatus, currentStep]);

  const handleColumnClick = useCallback((columnIndex: number) => {
    makeMove(columnIndex);
  }, [makeMove]);

  const handleColumnHover = useCallback((columnIndex: number) => {
    // Не обновляем выбранную колонку если игра завершена
    if (gameStatus === GameStatus.Win || gameStatus === GameStatus.Draw) {
      return;
    }
    setSelectedColumn(columnIndex);
  }, [gameStatus]);

  // Обработчики клавиш
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameStatus === GameStatus.Win || gameStatus === GameStatus.Draw) {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          setSelectedColumn(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          event.preventDefault();
          setSelectedColumn(prev => Math.min(6, prev + 1));
          break;
        case 'Enter':
          event.preventDefault();
          makeMove(selectedColumn);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedColumn, makeMove, gameStatus]);

  // Функция отмены хода
  const undoMove = useCallback(() => {
    if (undoStack.length === 0) return;

    const previousMoves = undoStack[undoStack.length - 1];
    const currentMoves = moves;
    
    // Сохраняем текущее состояние для возобновления
    setRedoStack(prev => [...prev, currentMoves]);
    
    // Возвращаемся к предыдущему состоянию
    setMoves(previousMoves);
    setUndoStack(prev => prev.slice(0, -1));
    
    // Пересчитываем состояние игры через валидатор
    const newResult = validator(previousMoves);
    setGameResult(newResult);
    
    const stepKey = `step_${previousMoves.length}`;
    const stepResult = newResult[stepKey];
    if (stepResult) {
      setGameStatus(stepResult.boardState);
      // Определяем текущего игрока на основе количества ходов
      setCurrentPlayer(previousMoves.length % 2 === 0 ? Player.First : Player.Second);
    }
  }, [undoStack, moves]);

  // Функция возобновления хода
  const redoMove = useCallback(() => {
    if (redoStack.length === 0) return;

    const nextMoves = redoStack[redoStack.length - 1];
    
    // Сохраняем текущее состояние для отмены
    setUndoStack(prev => [...prev, moves]);
    
    // Переходим к следующему состоянию
    setMoves(nextMoves);
    setRedoStack(prev => prev.slice(0, -1));
    
    // Пересчитываем состояние игры через валидатор
    const newResult = validator(nextMoves);
    setGameResult(newResult);
    
    const stepKey = `step_${nextMoves.length}`;
    const stepResult = newResult[stepKey];
    if (stepResult) {
      setGameStatus(stepResult.boardState);
      // Определяем текущего игрока на основе количества ходов
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
    clearGameState();
  }, []);

  const resetScore = useCallback(() => {
    setScore({ player1: 0, player2: 0 });
    saveScore({ player1: 0, player2: 0 });
  }, []);

  const getPlayerName = (player: Player) => {
    return player === Player.First ? 'Игрок 1' : 'Игрок 2';
  };

  const getPlayerColor = (player: Player) => {
    return player === Player.First ? 'bg-red-500' : 'bg-blue-500';
  };

  const getStatusMessage = () => {
    if (gameStatus === GameStatus.Win && currentStep?.winner) {
      const winnerPlayer = currentStep.winner.who === 'player_1' ? Player.First : Player.Second;
      return `🎉 ${getPlayerName(winnerPlayer)} победил!`;
    }
    if (gameStatus === GameStatus.Draw) {
      return '🤝 Ничья!';
    }
    if (gameStatus === GameStatus.Pending) {
      return `Ход: ${getPlayerName(currentPlayer)}`;
    }
    return 'Нажмите на колонку, чтобы начать игру';
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center bg-fixed bg-[url('../../public/back-tochka.png')]"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif" }}
    >
      <div className="p-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">
          4 в ряд
        </h1>
        
        <div className="text-center mb-6">
          <p className="text-xl text-white font-semibold">
            {getStatusMessage()}
          </p>
          <p className="text-sm text-white/70 mt-2">
            Используйте ← → для выбора колонки, Enter для размещения фишки
          </p>
          <p className="text-sm text-white/70 mt-2">
            Или можете пользоваться мышью
          </p>
        </div>

        {/* Счетчик очков */}
        <div className="flex justify-center gap-8 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[120px]">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span className="text-white font-semibold">Игрок 1</span>
            </div>
            <div className="text-2xl font-bold text-white text-center">
              {score.player1}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[120px]">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-white font-semibold">Игрок 2</span>
            </div>
            <div className="text-2xl font-bold text-white text-center">
              {score.player2}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 justify-center">
          {Array.from({ length: Lines.Columns }, (_, colIndex) => (
            <div
              key={colIndex}
              onClick={() => handleColumnClick(colIndex)}
              {...(gameStatus !== GameStatus.Win && gameStatus !== GameStatus.Draw && {
                onMouseEnter: () => handleColumnHover(colIndex)
              })}
              className={`
                cursor-pointer rounded-lg p-1 transition-all duration-200 ease-in-out h-fit w-fit
                ${selectedColumn === colIndex 
                  ? 'bg-blue-400/10 scale-105' 
                  : 'hover:bg-blue-400/10 hover:scale-102'
                }
                ${gameStatus === GameStatus.Win || gameStatus === GameStatus.Draw 
                  ? 'cursor-not-allowed opacity-50' 
                  : ''
                }
              `}
            >
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-5
                ${selectedColumn === colIndex 
                  ? 'bg-yellow-500 ring-4 ring-yellow-300' 
                  : gameStatus === GameStatus.Win || gameStatus === GameStatus.Draw
                    ? 'bg-blue-600'
                    : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 ease-in-out'
                }
              `}>
                <ArrowDown/>
              </div>
              
              <div className="flex flex-col gap-2">
                {Array.from({ length: Lines.Rows }, (_, rowIndex) => {
                  const row = rowIndex;
                  const col = colIndex;
                  const cell = currentStep ? 
                    [...currentStep.player_1, ...currentStep.player_2].find(pos => pos[0] === col && pos[1] === row) : null;
                  
                  const player = cell ? 
                    (currentStep?.player_1.some(pos => pos[0] === col && pos[1] === row) ? Player.First : Player.Second) : 
                    Player.Empty;

                  const isWinningCell = currentStep?.winner?.positions?.some(pos => pos[0] === col && pos[1] === row);

                  return (
                    <div
                      key={`${col}-${row}`}
                      className={`
                        w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center transition-all duration-300 ease-in-out
                        ${player === Player.Empty 
                          ? 'bg-gray-300/50' 
                          : `${getPlayerColor(player)} ${isWinningCell ? 'animate-pulse ring-4 ring-yellow-400 ring-opacity-75' : ''}`
                        }
                        ${gameStatus !== GameStatus.Win && gameStatus !== GameStatus.Draw ? 'hover:scale-105' : ''}
                      `}
                    >
                      {player !== Player.Empty && (
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-800">
                            {player === Player.First ? '1' : '2'}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={undoMove}
            disabled={undoStack.length === 0}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg"
          >
            Отмена хода
          </button>
          <button
            onClick={redoMove}
            disabled={redoStack.length === 0}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg"
          >
            Возобновление хода
          </button>
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg"
          >
            Новая игра
          </button>
          <button
            onClick={resetScore}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg"
          >
            Сбросить счет
          </button>
        </div>
      </div>
    </div>
  );
}