"use client";

import { useParams, useSearchParams } from "next/navigation";
import { ThreadDetail } from "@/components/email/thread-detail";

export default function ThreadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider") ?? undefined;

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <ThreadDetail threadId={id} provider={provider} />
    </div>
  );
}
