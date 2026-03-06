"use client";

import { useParams, useSearchParams } from "next/navigation";
import { ThreadDetail } from "@/components/email/thread-detail";

export default function ThreadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider") ?? undefined;

  return <ThreadDetail threadId={id} provider={provider} />;
}
