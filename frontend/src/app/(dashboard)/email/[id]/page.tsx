"use client";

import { useParams, useSearchParams } from "next/navigation";
import { EmailDetail } from "@/components/email/email-detail";

export default function EmailDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider") ?? undefined;

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <EmailDetail emailId={id} provider={provider} />
    </div>
  );
}
