import { GameStatus, Player, ValidatorStep } from '@/shared/types/index.types';

type GameStatusBarProps = {
    gameStatus: GameStatus,
    currentStep: ValidatorStep | null,
    currentPlayer: Player
}

export default function GameStatusBar({
  gameStatus,
  currentStep,
  currentPlayer,
}: GameStatusBarProps) {
  const getPlayerName = (player: Player) => (player === Player.First ? 'Игрок 1' : 'Игрок 2');

  const getStatusMessage = () => {
    if (gameStatus === GameStatus.Win && currentStep?.winner) {
      const winnerPlayer = currentStep.winner.who === 'player_1' ? Player.First : Player.Second;
      return `🎉 ${getPlayerName(winnerPlayer)} победил!`;
    }
    if (gameStatus === GameStatus.Draw) return '🤝 Ничья!';
    if (gameStatus === GameStatus.Pending) return `Ход: ${getPlayerName(currentPlayer)}`;
    return 'Выберите режим и нажмите на колонку, чтобы начать игру';
  };

  return (
    <div className="text-center mb-3">
      <p className="text-base md:text-lg text-white font-semibold">{getStatusMessage()}</p>
      <p className="text-xs md:text-sm text-white/70 mt-1 leading-relaxed">
                Используйте ← → или нажатие для выбора колонки<br />
                Enter или нажатие для размещения фишки
      </p>
    </div>
  );
}
