"use client";

import { useLanguage } from "@/LanguageContext";
import { translations } from "@/translations";
import { useState } from "react";
import HowToPlay from "./HowToPlay";
import HowToPlayButton from "./HowToPlayButton";
import LanguageMenu from "./LanguageMenu";
import LoginButton from "./LoginButton";

export default function LoginClient() {
  const { language } = useLanguage();
  const t = translations[language];
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);

  return (
    <>
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <LanguageMenu />
        <HowToPlayButton onClick={() => setHowToPlayOpen(true)} ariaLabel={t.howToPlayTitle} />
      </div>
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="mb-4 text-2xl font-bold">{t.appTitle}</h1>
        <p className="mb-8">{t.loginPrompt}</p>
        <LoginButton text={t.loginWithDiscord} />
      </div>
      <HowToPlay open={howToPlayOpen} onClose={() => setHowToPlayOpen(false)} />
    </>
  );
}
