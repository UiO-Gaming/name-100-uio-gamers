import React from "react";
import { MdOutlineTimer } from "react-icons/md";

interface TimerProps {
  timer: number;
}

const padZero = (num: number): string => String(num).padStart(2, "0");

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(remainingSeconds)}`;
  }

  return `${padZero(minutes)}:${padZero(remainingSeconds)}`;
};

const Timer: React.FC<TimerProps> = ({ timer }) => (
  <span className="text-accent-secondary bg-accent-secondary-light border-accent-secondary flex items-center gap-1 rounded-2xl border-2 p-2 font-bold">
    <MdOutlineTimer className="text-xl" />
    {formatTime(timer)}
  </span>
);

export default Timer;
