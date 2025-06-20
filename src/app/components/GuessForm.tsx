import { useLanguage } from "@/LanguageContext";
import { translations } from "@/translations";
import React from "react";

interface GuessFormProps {
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
}

const GuessForm: React.FC<GuessFormProps> = ({ input, onInputChange, onSubmit, disabled }) => {
  const { language } = useLanguage();
  const t = translations[language];
  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={onInputChange}
        className={`focus:border-accent-primary h-12 w-60 rounded border px-2 py-1 focus:outline-none md:w-75 ${
          disabled ? "cursor-not-allowed border-gray-500 bg-gray-400 opacity-50" : "bg-background-secondary duration-300"
        }`}
        placeholder={t.placeholder}
        disabled={disabled}
      />
      <button
        type="submit"
        className={`rounded px-4 py-1 ${
          !input || disabled ? "cursor-not-allowed bg-gray-400 opacity-50" : "bg-accent-primary cursor-pointer"
        }`}
        disabled={disabled || !input}
      >
        {t.submit}
      </button>
    </form>
  );
};

export default GuessForm;
