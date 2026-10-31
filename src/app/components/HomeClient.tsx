"use client";

import { useLanguage } from "@/LanguageContext";
import { translations } from "@/translations";
import type { Match } from "@/types";
import type { Session } from "next-auth";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Footer from "./Footer";
import GoalSelector from "./GoalSelector";
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
  const gameIdRef = useRef(0);
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { language } = useLanguage();
  const t = translations[language];
  const [goalAmount, setGoalAmount] = useState(100);
  const [totalMembers, setTotalMembers] = useState(0);

  useEffect(() => {
    const fetchTotalMembers = async () => {
      try {
        const res = await fetch("/api/members/count");
        if (res.ok) {
          const data = await res.json();
          setTotalMembers(data.count);
        }
      } catch (error) {
        console.error("Failed to fetch total members", error);
      }
    };
    fetchTotalMembers();
  }, []);

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
    if (correctMatchesCount === goalAmount) {
      stopTimer();
    }
  }, [correctMatchesCount, goalAmount]);

  const handleRestart = () => {
    gameIdRef.current++;
    stopTimer();
    setTimer(0);
    setTimerStarted(false);
    setMatches([]);
    setInput("");
    setErrorMessage("");
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput) return;
    if (matches.some((m) => !m.name && m.input.toLowerCase() === trimmedInput.toLowerCase())) {
      setErrorMessage(t.alreadySubmitted);
      return;
    }
    setErrorMessage("");
    setLoading(true);
    const gameId = gameIdRef.current;

    try {
      const guessedIds = matches.flatMap((m) => (m.correct && m.id ? [m.id] : []));

      const res = await fetch("/api/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: trimmedInput, guessedIds }),
      });
      const data: Match | null = res.ok ? await res.json() : null;

      if (gameId !== gameIdRef.current) return;
      if (!data) {
        setErrorMessage(res.status === 401 ? t.sessionExpired : t.guessFailed);
        return;
      }

      setInput("");
      if (data.id && matches.some((m) => m.id === data.id)) {
        setErrorMessage(t.alreadySubmitted);
        return;
      }
      setMatches((prev) => [...prev, data]);

      if (data.correct && !timerStarted) {
        startTimer();
      }
    } catch (error) {
      console.error("Error submitting guess:", error);
      if (gameId === gameIdRef.current) setErrorMessage(t.guessFailed);
    } finally {
      if (gameId === gameIdRef.current) setLoading(false);
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
      <Header goalAmount={goalAmount} />
      <main className="row-start-2 flex w-full flex-1 flex-col items-center gap-6 px-4 pt-28 pb-12 sm:pt-12">
        {!timerStarted && (
          <GoalSelector
            goalAmount={goalAmount}
            setGoalAmount={(amount) => {
              setGoalAmount(amount);
              handleRestart();
            }}
            totalMembers={totalMembers}
            disabled={timerStarted}
          />
        )}
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
            setErrorMessage("");
          }}
          onSubmit={handleSubmit}
          disabled={correctMatchesCount === goalAmount}
          loading={loading}
        />
        <Score matchesCount={correctMatchesCount} goalAmount={goalAmount} />
        {errorMessage && <div className="mb-2 font-semibold text-red-500">{errorMessage}</div>}
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
