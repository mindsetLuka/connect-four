type PlayerScoreCardProps = {
    color: string;
    name: string;
    score: number;
  };
  
  export default function PlayerScoreCard({ color, name, score }: PlayerScoreCardProps) {
    return (
      <div className="bg-white/10 rounded-lg p-2 md:p-3 min-w-[80px] md:min-w-[100px]">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className={`w-3 h-3 ${color} rounded-full`} />
          <span className="text-white font-semibold text-xs md:text-sm">{name}</span>
        </div>
        <div className="text-lg md:text-xl font-bold text-white text-center">{score}</div>
      </div>
    );
  }
  