import ControlButton from '@/components/controlButton/controlButton';
import { Dispatch, SetStateAction } from 'react';
import { GameStatus } from '@/shared/types/index.types';

type GameControlsProps = {
  undoMove: () => void,
  redoMove: () => void,
  resetGame: () => void,
  resetScore: () => void,
  undoDisabled: boolean,
  redoDisabled: boolean,
  playVsBot: boolean,
  setPlayVsBot: Dispatch<SetStateAction<boolean>>,
  gameStatus: GameStatus,
}

export default function GameControls({
  undoMove,
  redoMove,
  resetGame,
  resetScore,
  undoDisabled,
  redoDisabled,
  playVsBot,
  setPlayVsBot,
  gameStatus,
}: GameControlsProps) {
  const isWaiting = gameStatus === GameStatus.Waiting;

  return (
    <div className="flex flex-col gap-3">
      {isWaiting && (
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          <ControlButton
            onClick={() => setPlayVsBot(true)}
            className={`${playVsBot ? 'ring-3 ring-indigo-400 bg-white' : ''}`}
            label="Игра с ботом"
          />
          <ControlButton
            onClick={() => setPlayVsBot(false)}
            className={`${!playVsBot ? 'ring-3 ring-indigo-400 bg-white' : ''}`}
            label="Игра с другом"
          />
        </div>
      )}
      {!isWaiting && (
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          <ControlButton onClick={undoMove} disabled={undoDisabled} label="Отмена хода" />
          <ControlButton onClick={redoMove} disabled={redoDisabled} label="Возобновление" />
          <ControlButton onClick={resetScore} label="Сбросить счёт" />
          <ControlButton onClick={resetGame} label="Новая игра" />
        </div>
      )}
    </div>
  );
}
