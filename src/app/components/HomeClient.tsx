"use client";

import { GOAL_AMOUNT } from "@/consts";
import { useLanguage } from "@/LanguageContext";
import { translations } from "@/translations";
import type { Match } from "@/types";
import type { Session } from "next-auth";
import Image from "next/image";
import React, { useMemo, useRef, useState } from "react";
import Footer from "./Footer";
import GuessesList from "./GuessesList";
import GuessForm from "./GuessForm";
import Header from "./Header";
import HowToPlay from "./HowToPlay";
import HowToPlayButton from "./HowToPlayButton";
import LanguageMenu from "./LanguageMenu";
import LogoutButton from "./LogoutButton";
import RestartButton from "./RestartButton";
import Score from "./Score";
import Timer from "./Timer";

export default function HomeClient({ session }: { session: Session }) {
  const [input, setInput] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [timer, setTimer] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [loading, setLoading] = useState(false);
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
    if (correctMatchesCount === GOAL_AMOUNT) {
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
    setLoading(true);

    try {
      const res = await fetch("/api/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: trimmedInput }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.name && matches.some((m) => m.name && m.name.toLowerCase() === data.name.toLowerCase())) {
          setRepeatMessage(t.alreadySubmitted);
          setInput("");
          return;
        }
        setMatches((prev) => [...prev, { input: trimmedInput, ...data }]);
        if (data.correct && !timerStarted) {
          startTimer();
        }
      }
    } catch (error) {
      console.error("Error submitting guess:", error);
      setRepeatMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="grid min-h-dvh grid-rows-[auto,1fr,auto]">
      <div className="absolute top-4 right-4 left-4 z-50 flex flex-wrap items-center justify-between gap-4">
        {session.user && (
          <div className="flex items-center gap-4">
            <LogoutButton />
            <div className="flex items-center gap-2">
              <Image
                src={session.user.image!}
                alt={session.user.name!}
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-semibold">{session.user.name}</span>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <LanguageMenu />
          <HowToPlayButton onClick={() => setHowToPlayOpen(true)} ariaLabel={t.howToPlayTitle} />
        </div>
      </div>
      <Header />
      <main className="row-start-2 flex w-full flex-1 flex-col items-center gap-6 px-4 pt-28 pb-12 sm:pt-12">
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
          disabled={correctMatchesCount === GOAL_AMOUNT}
          loading={loading}
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
      <Footer className="self-end" />
      <HowToPlay open={howToPlayOpen} onClose={() => setHowToPlayOpen(false)} />
    </div>
  );
}
