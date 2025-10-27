import { ArrowDown } from '@geist-ui/icons';
import { Lines, Player, GameStatus, ValidatorStep, ColumnX } from '@/shared/types/index.types';
import Cell from '@/components/cell/cell';

type GameColumnProps = {
    colIndex: number,
    gameStatus: GameStatus,
    currentStep: ValidatorStep | null,
    selectedColumn: ColumnX,
    onColumnClick: ({}: ColumnX) => void,
    onColumnHover: ({}: ColumnX) => void
}

export default function GameColumn({
  colIndex,
  gameStatus,
  currentStep,
  selectedColumn,
  onColumnClick,
  onColumnHover,
}: GameColumnProps) {
  const getPlayerColor = (player: Player) =>
    player === Player.First ? 'bg-red-500' : 'bg-blue-500';

  const isGameOver = gameStatus === GameStatus.Win || gameStatus === GameStatus.Draw;

  return (
    <div
      onClick={() => onColumnClick(colIndex)}
      {...(!isGameOver && { onMouseEnter: () => onColumnHover(colIndex) })}
      className={`cursor-pointer rounded-lg p-0.5 md:p-1 transition-all duration-200 ease-in-out
        ${selectedColumn === colIndex ? 'bg-blue-400/10 scale-105' : 'hover:bg-blue-400/10'}
        ${isGameOver ? 'cursor-not-allowed opacity-50' : ''}
      `}
    >
      <div
        className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold mb-2 mx-auto
          ${selectedColumn === colIndex ? 'bg-yellow-500 ring-2 ring-yellow-300' : 'bg-blue-600'}
        `}
      >
        <ArrowDown className="w-3 h-3 md:w-4 md:h-4" />
      </div>
      <div className="flex flex-col gap-1">
        {Array.from({ length: Lines.Rows }, (_, rowIndex) => (
          <Cell
            key={`${colIndex}-${rowIndex}`}
            col={colIndex}
            row={rowIndex}
            currentStep={currentStep}
            gameStatus={gameStatus}
            getPlayerColor={getPlayerColor}
          />
        ))}
      </div>
    </div>
  );
}
