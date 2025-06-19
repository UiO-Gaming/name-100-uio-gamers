import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { input } = await request.json();
  const correct = input === "test" || input === "test2";
  return NextResponse.json({ input, name: input.toUpperCase(), correct, description: "title of person" });
}
