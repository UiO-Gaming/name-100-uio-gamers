import type { Match } from "@/types";
import React from "react";

interface GuessesListProps {
  matches: Match[];
}

const GuessesList: React.FC<GuessesListProps> = ({ matches }) => (
  <ul className="flex w-full max-w-md flex-col gap-4">
    {[...matches].reverse().map((match, idx) => (
      <li
        key={idx}
        className={`${
          match.correct
            ? "border-1 border-green-600 bg-green-100 text-green-600"
            : "border-1 border-red-600 bg-red-100 text-red-600"
        } rounded-xl p-4 text-center`}
      >
        <p className="text-lg font-bold">{match.name ?? match.input}</p>
        <p className="text-sm font-extralight">{match.description}</p>
      </li>
    ))}
  </ul>
);

export default GuessesList;
