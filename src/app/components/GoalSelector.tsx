"use client";

import { useLanguage } from "@/LanguageContext";
import { translations } from "@/translations";
import React from "react";

interface GoalSelectorProps {
  goalAmount: number;
  setGoalAmount: (amount: number) => void;
  totalMembers: number;
  disabled: boolean;
}

const GoalSelector: React.FC<GoalSelectorProps> = ({ goalAmount, setGoalAmount, totalMembers, disabled }) => {
  const { language } = useLanguage();
  const t = translations[language];

  const options = [25, 50, 100];
  if (totalMembers > 0 && !options.includes(totalMembers)) {
    // Add totalMembers to options and sort
    options.push(totalMembers);
    options.sort((a, b) => a - b);
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="goal-select" className="font-semibold">
        {t.goalSelectorLabel}
      </label>
      <select
        id="goal-select"
        value={goalAmount}
        onChange={(e) => setGoalAmount(Number(e.target.value))}
        disabled={disabled}
        className="rounded border border-gray-300 bg-white px-2 py-1 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === totalMembers ? `${t.subject} (${option})` : option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default GoalSelector;
