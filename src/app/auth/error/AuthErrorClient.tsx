"use client";

import LanguageMenu from "@/components/LanguageMenu";
import { useLanguage } from "@/LanguageContext";
import { translations } from "@/translations";
import { signIn } from "next-auth/react";
import { FaDiscord } from "react-icons/fa";

export default function AuthErrorClient() {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <>
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <LanguageMenu />
      </div>
      <div className="flex h-screen flex-col items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-500">{t.accessDenied}</h1>
          <p className="text-foreground mb-6">{t.accessDeniedMessage}</p>
          <div className="flex justify-center">
            <button
              onClick={() => signIn("discord")}
              className="flex cursor-pointer items-center gap-2 rounded-md bg-[#5865F2] px-4 py-2 text-white hover:bg-[#4654C0]"
            >
              <FaDiscord />
              {t.tryAgain}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
