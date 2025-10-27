import { Player, GameStatus, ColumnX, RowY, ValidatorStep } from '@/shared/types/index.types';

type CellProps = {
    col: ColumnX,
    row: RowY,
    currentStep: ValidatorStep | null,
    getPlayerColor: ({}:Player) => 'bg-red-500' | 'bg-yellow-500'
}

export default function Cell({
  col,
  row,
  currentStep,
  getPlayerColor,
}: CellProps) {
  const cell = currentStep
    ? [...currentStep.player_1, ...currentStep.player_2].find(pos => pos[0] === col && pos[1] === row)
    : null;

  const player = cell
    ? (currentStep?.player_1.some(pos => pos[0] === col && pos[1] === row)
      ? Player.First
      : Player.Second)
    : Player.Empty;

  const isWinningCell = currentStep?.winner?.positions?.some(pos => pos[0] === col && pos[1] === row);

  return (
    <div
      className={`w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/30 flex items-center justify-center transition-all
        ${player === Player.Empty
      ? 'bg-gray-300/50'
      : `${getPlayerColor(player)} ${isWinningCell ? 'animate-pulse ring-3 ring-white' : ''}`}
      `}
    >
    </div>
  );
}
