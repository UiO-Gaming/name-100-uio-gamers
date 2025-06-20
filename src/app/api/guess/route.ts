import type { Match } from "@/types";
import { NextResponse } from "next/server";
import { findNorwegianPerson } from "./dataProvider";

export async function POST(request: Request) {
  const { input } = await request.json();
  const match: Match = await findNorwegianPerson(input);
  return NextResponse.json(match);
}
