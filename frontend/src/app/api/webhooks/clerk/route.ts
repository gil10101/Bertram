import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const eventType = payload.type as string;

  switch (eventType) {
    case "user.created":
    case "user.updated":
      // Sync user data to backend / Supabase
      break;
    case "user.deleted":
      // Clean up user data
      break;
  }

  return NextResponse.json({ received: true });
}
