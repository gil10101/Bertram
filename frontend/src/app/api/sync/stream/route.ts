import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
  const response = await fetch(
    `${backendUrl}/sync/stream?token=${encodeURIComponent(token)}`,
  );

  if (!response.ok || !response.body) {
    return new NextResponse("Backend error", { status: response.status });
  }

  // Stream the SSE response through to the client
  return new NextResponse(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
