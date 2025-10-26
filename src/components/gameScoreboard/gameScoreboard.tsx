import { GameScore } from '@shared/types/index.types';
import PlayerScoreCard from '@/components/playerScoreCard/playerScoreCard';

type GameScoreboardProps = {
  score: GameScore;
};

export default function GameScoreboard({ score }: GameScoreboardProps) {
  return (
    <div className="flex justify-center gap-3 md:gap-6 mb-3">
      <PlayerScoreCard color="bg-red-500" name="Игрок 1" score={score.player1} />
      <PlayerScoreCard color="bg-blue-500" name="Игрок 2" score={score.player2} />
    </div>
  );
}
