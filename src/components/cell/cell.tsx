import { Player, ColumnX, RowY, ValidatorStep } from '@/shared/types/index.types';

type CellProps = {
  col: ColumnX;
  row: RowY;
  currentStep: ValidatorStep | null;
  getPlayerColor: (player: Player) => 'bg-red-500' | 'bg-yellow-500';
};

export default function Cell({
  col,
  row,
  currentStep,
  getPlayerColor,
}: CellProps) {
  if (!currentStep) {
    return (
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/30 flex items-center justify-center bg-gray-300/50 transition-all" />
    );
  }
  const { player_1, player_2, winner } = currentStep;
  const isPlayer1 = player_1.some(([c, r]) => c === col && r === row);
  const isPlayer2 = player_2.some(([c, r]) => c === col && r === row);
  const hasChip = isPlayer1 || isPlayer2;
  const player = hasChip ? (isPlayer1 ? Player.First : Player.Second) : Player.Empty;
  const isWinningCell = winner?.positions?.some(([c, r]) => c === col && r === row);
  const baseClasses = 'w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/30 flex items-center justify-center transition-all';
  const cellClasses =
    player === Player.Empty
      ? 'bg-gray-300/50'
      : `${getPlayerColor(player)} ${isWinningCell ? 'animate-pulse ring-3 ring-white' : ''}`;

  return (
    <div className={`${baseClasses} ${cellClasses}`} />
  );
}
