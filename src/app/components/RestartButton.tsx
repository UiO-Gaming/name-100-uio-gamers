import React from "react";
import { VscDebugRestart } from "react-icons/vsc";

interface RestartButtonProps {
  onClick: () => void;
}

const RestartButton: React.FC<RestartButtonProps> = ({ onClick }) => (
  <button
    className="border-accent2 text-accent2 bg-accent2light hover:bg-accent2 hover:border-accent2light hover:text-accent2light cursor-pointer rounded-full border-2 p-2 text-xl"
    onClick={onClick}
  >
    <VscDebugRestart />
  </button>
);

export default RestartButton;
