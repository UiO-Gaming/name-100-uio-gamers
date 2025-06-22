import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { getPayingMemberCount } from "../../guess/dataProvider";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const count = await getPayingMemberCount();
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching paying member count:", error);
    return NextResponse.json({ error: "Failed to fetch paying member count" }, { status: 500 });
  }
}
