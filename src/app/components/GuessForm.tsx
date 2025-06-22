import { useLanguage } from "@/LanguageContext";
import { translations } from "@/translations";
import React, { useEffect, useRef } from "react";

interface GuessFormProps {
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
  loading?: boolean;
}

const GuessForm: React.FC<GuessFormProps> = ({ input, onInputChange, onSubmit, disabled, loading }) => {
  const { language } = useLanguage();
  const t = translations[language];
  const inputRef = useRef<HTMLInputElement>(null);
  const prevInputRef = useRef(input);

  // Focus input when it gets cleared after submission
  useEffect(() => {
    if (prevInputRef.current && !input && !loading) {
      inputRef.current?.focus();
    }
    prevInputRef.current = input;
  }, [input, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={onInputChange}
        className={`focus:border-accent-primary h-12 w-60 rounded border px-2 py-1 focus:outline-none md:w-75 ${
          disabled || loading
            ? "cursor-not-allowed border-gray-500 bg-gray-400 opacity-50"
            : "bg-background-secondary duration-300"
        }`}
        placeholder={loading ? t.loading || "Loading..." : t.placeholder}
        disabled={disabled || loading}
      />
      <button
        type="submit"
        className={`rounded px-4 py-1 text-white ${
          !input || disabled || loading
            ? "cursor-not-allowed bg-gray-400 opacity-50"
            : "bg-accent-primary cursor-pointer"
        }`}
        disabled={disabled || !input || loading}
      >
        {loading ? t.loading || "Loading..." : t.submit}
      </button>
    </form>
  );
};

export default GuessForm;
