import { useMemo } from 'react';
import { ArrowDown } from '@geist-ui/icons';
import { Lines, Player, GameStatus, ValidatorStep, ColumnX } from '@/shared/types/index.types';
import Cell from '@/components/cell/cell';

type ColumnProps = {
  colIndex: number
  gameStatus: GameStatus
  currentStep: ValidatorStep | null
  selectedColumn: ColumnX
  onColumnClick: (col: ColumnX) => void
  onColumnHover: (col: ColumnX) => void
}

export default function Column({
  colIndex,
  gameStatus,
  currentStep,
  selectedColumn,
  onColumnClick,
  onColumnHover,
}: ColumnProps) {
  const getPlayerColor = (player: Player) =>
    player === Player.First ? 'bg-red-500' : 'bg-yellow-500';
  const isGameOver = gameStatus === GameStatus.Win || gameStatus === GameStatus.Draw;
  const isSelected = selectedColumn === colIndex && !isGameOver;
  const handleClick = () => {
    if (!isGameOver) onColumnClick(colIndex);
  };
  const handleHover = () => {
    if (!isGameOver) onColumnHover(colIndex);
  };

  const cells = useMemo(
    () =>
      Array.from({ length: Lines.Rows }, (_, rowIndex) => (
        <Cell
          key={`${colIndex}-${rowIndex}`}
          col={colIndex}
          row={rowIndex}
          currentStep={currentStep}
          getPlayerColor={getPlayerColor}
        />
      )),
    [colIndex, currentStep],
  );

  const columnClass = `
    cursor-pointer rounded-lg p-0.5 md:p-1
    transition-transform duration-200 ease-in-out
    ${isSelected ? 'bg-blue-400/10 scale-105' : 'hover:bg-blue-400/10'}
    ${isGameOver ? 'cursor-not-allowed opacity-50' : ''}
  `;

  const arrowClass = `
    w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold mb-2 mx-auto
    ${isSelected ? 'bg-fuchsia-500' : 'bg-fuchsia-400'}
  `;

  return (
    <div
      role="button"
      aria-label={`Column ${colIndex + 1}`}
      onClick={handleClick}
      onMouseEnter={handleHover}
      className={columnClass}
    >
      <div className={arrowClass}>
        <ArrowDown className="w-3 h-3 md:w-4 md:h-4" />
      </div>
      <div className="flex flex-col gap-1">{cells}</div>
    </div>
  );
}
