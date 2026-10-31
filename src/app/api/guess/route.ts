import { authOptions } from "@/lib/auth";
import { findDiscordMember } from "@/lib/members";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { input, guessedIds } = await request.json();

  try {
    return NextResponse.json(await findDiscordMember(input, guessedIds));
  } catch (error) {
    console.error("Error finding Discord member:", error);
    return NextResponse.json({ error: "Failed to look up member" }, { status: 503 });
  }
}
