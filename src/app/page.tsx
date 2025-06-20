"use client";

import { LanguageProvider, useLanguage } from "@/LanguageContext";
import { translations } from "@/translations";
import React, { useMemo, useRef, useState } from "react";
import Footer from "./components/Footer";
import GuessesList from "./components/GuessesList";
import GuessForm from "./components/GuessForm";
import Header from "./components/Header";
import HowToPlay from "./components/HowToPlay";
import HowToPlayButton from "./components/HowToPlayButton";
import LanguageMenu from "./components/LanguageMenu";
import RestartButton from "./components/RestartButton";
import Score from "./components/Score";
import Timer from "./components/Timer";
import type { Match } from "./types";

export default function HomePageWithLanguage() {
  return (
    <LanguageProvider>
      <Home />
    </LanguageProvider>
  );
}

function Home() {
  const [input, setInput] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [timer, setTimer] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [repeatMessage, setRepeatMessage] = useState("");
  const { language } = useLanguage();
  const t = translations[language];

  const correctMatchesCount = useMemo(() => matches.filter((m) => m.correct).length, [matches]);

  const startTimer = () => {
    if (!timerStarted) {
      setTimerStarted(true);
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  React.useEffect(() => {
    return () => stopTimer();
  }, []);

  // Stop timer when 100 correct guesses are made
  React.useEffect(() => {
    if (correctMatchesCount === 100) {
      stopTimer();
    }
  }, [correctMatchesCount]);

  const handleRestart = () => {
    stopTimer();
    setTimer(0);
    setTimerStarted(false);
    setMatches([]);
    setInput("");
    setRepeatMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;
    if (matches.some((m) => m.input.toLowerCase() === trimmedInput.toLowerCase())) {
      setRepeatMessage(t.alreadySubmitted);
      return;
    }
    setRepeatMessage("");
    const res = await fetch("/api/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: trimmedInput }),
    });
    if (res.ok) {
      const data = await res.json();
      setMatches((prev) => [...prev, { input: trimmedInput, ...data }]);
      if (data.correct && !timerStarted) {
        startTimer();
      }
    }
    setInput("");
  };

  return (
    <div className="grid min-h-dvh grid-rows-[auto,1fr,auto] gap-12 pt-15">
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <LanguageMenu />
        <HowToPlayButton onClick={() => setHowToPlayOpen(true)} ariaLabel={t.howToPlayTitle} />
      </div>
      <Header />
      <main className="row-start-2 flex w-full flex-1 flex-col items-center gap-6 px-4">
        {timerStarted && (
          <div className="flex gap-4">
            <RestartButton onClick={handleRestart} />
            <Timer timer={timer} />
          </div>
        )}
        <GuessForm
          input={input}
          onInputChange={(e) => {
            setInput(e.target.value);
            setRepeatMessage("");
          }}
          onSubmit={handleSubmit}
          disabled={correctMatchesCount === 100}
        />
        <Score matchesCount={correctMatchesCount} />
        {repeatMessage && <div className="mb-2 font-semibold text-red-500">{repeatMessage}</div>}
        {matches.length > 0 && (
          <>
            <h2 className="mt-4 text-2xl">{t.submittedAnswers}</h2>
            <GuessesList matches={matches} />
          </>
        )}
      </main>
      <Footer />
      <HowToPlay open={howToPlayOpen} onClose={() => setHowToPlayOpen(false)} />
    </div>
  );
}
