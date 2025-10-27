import { Lines, GameStatus, ValidatorStep, ColumnX } from '@/shared/types/index.types';
import Column from '@/components/column/column';

type GameBoardProps = {
    gameStatus: GameStatus,
    currentStep: ValidatorStep | null,
    selectedColumn: ColumnX,
    onColumnClick: (col: ColumnX) => void,
    onColumnHover: (col: ColumnX) => void
}

export default function GameBoard({
  gameStatus,
  currentStep,
  selectedColumn,
  onColumnClick,
  onColumnHover,
}: GameBoardProps) {
  return (
    <div className="flex justify-center mb-3">
      <div className="flex gap-1 md:gap-2 justify-center items-center scale-90 md:scale-100">
        {Array.from({ length: Lines.Columns }, (_, colIndex) => (
          <Column
            key={colIndex}
            colIndex={colIndex}
            gameStatus={gameStatus}
            currentStep={currentStep}
            selectedColumn={selectedColumn}
            onColumnClick={onColumnClick}
            onColumnHover={onColumnHover}
          />
        ))}
      </div>
    </div>
  );
}
