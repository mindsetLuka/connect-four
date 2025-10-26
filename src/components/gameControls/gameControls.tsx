import ControlButton from '@/components/controlButton/controlButton';

type GameControlsProps = {
  undoMove: () => void;
  redoMove: () => void;
  resetGame: () => void;
  resetScore: () => void;
  undoDisabled: boolean;
  redoDisabled: boolean;
};

export default function GameControls({
  undoMove,
  redoMove,
  resetGame,
  resetScore,
  undoDisabled,
  redoDisabled
}: GameControlsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 md:gap-3">
      <ControlButton onClick={undoMove} disabled={undoDisabled} label="Отмена хода" />
      <ControlButton onClick={redoMove} disabled={redoDisabled} label="Возобновление" />
      <ControlButton onClick={resetScore} label="Сбросить счёт" />
      <ControlButton onClick={resetGame} label="Новая игра" />
    </div>
  );
}
