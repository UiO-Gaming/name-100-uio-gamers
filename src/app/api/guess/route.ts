import { authOptions } from "@/lib/auth";
import { findDiscordMember } from "@/lib/members";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

const MAX_INPUT_LENGTH = 100;
const MAX_GUESSED_IDS = 10_000;

function parseGuess(body: unknown): { input: string; guessedIds: string[] } | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const { input, guessedIds } = body as Record<string, unknown>;

  if (typeof input !== "string" || !input.trim() || input.length > MAX_INPUT_LENGTH) {
    return null;
  }
  if (
    !Array.isArray(guessedIds) ||
    guessedIds.length > MAX_GUESSED_IDS ||
    !guessedIds.every((id) => typeof id === "string")
  ) {
    return null;
  }

  return { input, guessedIds };
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const guess = parseGuess(await request.json().catch(() => null));
  if (!guess) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    return NextResponse.json(await findDiscordMember(guess.input, guess.guessedIds));
  } catch (error) {
    console.error("Error finding Discord member:", error);
    return NextResponse.json({ error: "Failed to look up member" }, { status: 503 });
  }
}
