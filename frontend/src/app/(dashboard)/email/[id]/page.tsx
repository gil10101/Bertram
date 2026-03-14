"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { EmailDetail } from "@/components/email/email-detail";
import { StandardLayout } from "@/components/common/standard-layout";

function EmailDetailContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider") ?? undefined;

  return (
    <StandardLayout>
      <div className="h-full overflow-y-auto p-4 md:p-6">
        <EmailDetail emailId={id} provider={provider} />
      </div>
    </StandardLayout>
  );
}

export default function EmailDetailPage() {
  return (
    <Suspense>
      <EmailDetailContent />
    </Suspense>
  );
}
