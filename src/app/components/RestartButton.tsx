import React from "react";
import { VscDebugRestart } from "react-icons/vsc";

interface RestartButtonProps {
  onClick: () => void;
}

const RestartButton: React.FC<RestartButtonProps> = ({ onClick }) => (
  <button
    className="border-accent-secondary text-accent-secondary bg-accent-secondary-light hover:bg-accent-secondary hover:border-accent-secondary-light hover:text-accent-secondary-light cursor-pointer rounded-full border-2 p-2 text-xl duration-300"
    onClick={onClick}
  >
    <VscDebugRestart />
  </button>
);

export default RestartButton;
