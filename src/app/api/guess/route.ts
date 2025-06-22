import { authOptions } from "@/api/auth/[...nextauth]/route";
import type { Match } from "@/types";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { findDiscordMember } from "./dataProvider";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { input } = await request.json();
  const match: Match = await findDiscordMember(input);
  return NextResponse.json(match);
}
