import { useLanguage } from "@/LanguageContext";
import { translations } from "@/translations";
import React from "react";

interface HowToPlayProps {
  open: boolean;
  onClose: () => void;
}

const HowToPlay: React.FC<HowToPlayProps> = ({ open, onClose }) => {
  const { language } = useLanguage();
  const t = translations[language];
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
      <div className="relative max-w-md rounded-lg bg-gray-300 p-8" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-2 right-4 cursor-pointer text-4xl text-gray-500 hover:text-gray-900"
          aria-label="Close"
        >
          &times;
        </button>
        <p className="text-accent mb-4 text-2xl font-bold">{t.howToPlayTitle}</p>
        <ul className="list-disc space-y-2 text-gray-700">
          <li>{t.howToPlay1}</li>
          <li>{t.howToPlay2}</li>
          <li>{t.howToPlay3}</li>
        </ul>
      </div>
    </div>
  );
};

export default HowToPlay;
