import { Player, GameStatus, ColumnX, RowY, ValidatorStep } from '@/shared/types/index.types';

type GameCellProps = {
    col: ColumnX,
    row: RowY,
    currentStep: ValidatorStep | null,
    gameStatus: GameStatus,
    getPlayerColor: (player: Player) => "bg-red-500" | "bg-blue-500"
}


export default function GameCell({
    col,
    row,
    currentStep,
    gameStatus,
    getPlayerColor
}: GameCellProps) {
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
                    : `${getPlayerColor(player)} ${isWinningCell ? 'animate-pulse ring-2 ring-yellow-400' : ''}`}
        ${gameStatus !== GameStatus.Win && gameStatus !== GameStatus.Draw ? 'hover:scale-105' : ''}
      `}
        >
            {player !== Player.Empty && (
                <div className="w-4 h-4 md:w-5 md:h-5 bg-white rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-800">{player === Player.First ? '1' : '2'}</span>
                </div>
            )}
        </div>
    );
}
