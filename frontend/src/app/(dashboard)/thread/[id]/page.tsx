"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ThreadDetail } from "@/components/email/thread-detail";
import { StandardLayout } from "@/components/common/standard-layout";

function ThreadDetailContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider") ?? undefined;

  return (
    <StandardLayout>
      <div className="h-full overflow-y-auto p-4 md:p-6">
        <ThreadDetail threadId={id} provider={provider} />
      </div>
    </StandardLayout>
  );
}

export default function ThreadDetailPage() {
  return (
    <Suspense>
      <ThreadDetailContent />
    </Suspense>
  );
}
