import React from "react";

interface ScoreProps {
  matchesCount: number;
}

const Score: React.FC<ScoreProps> = ({ matchesCount }) => {
  return (
    <p className="text-xl">
      <span className="font-bold">{matchesCount}</span> / 100
    </p>
  );
};

export default Score;
