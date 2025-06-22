import React from "react";

interface ScoreProps {
  matchesCount: number;
  goalAmount: number;
}

const Score: React.FC<ScoreProps> = ({ matchesCount, goalAmount }) => {
  return (
    <p className="text-xl">
      <span className="font-bold">{matchesCount}</span> / {goalAmount}
    </p>
  );
};

export default Score;
