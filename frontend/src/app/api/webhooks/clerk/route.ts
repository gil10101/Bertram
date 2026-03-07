import { NextResponse } from "next/server";

// Clerk webhook endpoint — not currently in use.
// User data is synced to Supabase on each authenticated backend request instead.
// Re-enable with Svix signature verification when webhook-based sync is needed.
export async function POST() {
  return NextResponse.json({ received: true }, { status: 200 });
}
