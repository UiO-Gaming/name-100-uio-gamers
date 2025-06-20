import React from "react";
import { MdOutlineTimer } from "react-icons/md";

interface TimerProps {
  timer: number;
}

const Timer: React.FC<TimerProps> = ({ timer }) => {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const padZero = (num: number): string => String(num).padStart(2, "0");

    if (hours > 0) {
      return `${padZero(hours)}:${padZero(minutes)}:${padZero(remainingSeconds)}`;
    }

    return `${padZero(minutes)}:${padZero(remainingSeconds)}`;
  };

  return (
    <span className="text-accent2 bg-accent2light border-accent2 flex items-center gap-1 rounded-2xl border-2 p-2 font-bold">
      <MdOutlineTimer className="text-xl" />
      {formatTime(timer)}
    </span>
  );
};

export default Timer;
