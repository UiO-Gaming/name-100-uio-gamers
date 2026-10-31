import { useLanguage } from "@/LanguageContext";
import { translations } from "@/translations";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import React from "react";

interface HowToPlayProps {
  open: boolean;
  onClose: () => void;
}

const HowToPlay: React.FC<HowToPlayProps> = ({ open, onClose }) => {
  const { language } = useLanguage();
  const t = translations[language];
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/80" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="relative max-w-md rounded-lg bg-gray-300 p-8">
          <button
            onClick={onClose}
            className="absolute top-2 right-4 cursor-pointer text-4xl text-gray-500 hover:text-gray-900"
            aria-label={t.close}
          >
            &times;
          </button>
          <DialogTitle className="text-accent-primary mb-4 text-2xl font-bold">{t.howToPlayTitle}</DialogTitle>
          <ul className="list-disc space-y-2 text-gray-700">
            <li>{t.howToPlay1}</li>
            <li>{t.howToPlay2}</li>
            <li>{t.howToPlay3}</li>
          </ul>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default HowToPlay;
