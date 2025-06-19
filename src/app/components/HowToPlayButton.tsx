import React from "react";
import { IoHelpCircle } from "react-icons/io5";

interface HowToPlayButtonProps {
  onClick: () => void;
  ariaLabel: string;
}

const HowToPlayButton: React.FC<HowToPlayButtonProps> = ({ onClick, ariaLabel }) => (
  <button
    className="text-accent border-accent hover:bg-accent cursor-pointer rounded-full border bg-white p-2 text-2xl duration-300 hover:text-white"
    onClick={onClick}
    aria-label={ariaLabel}
  >
    <IoHelpCircle />
  </button>
);

export default HowToPlayButton;
