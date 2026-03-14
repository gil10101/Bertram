"use client";

import { Suspense } from "react";
import { EmailCompose } from "@/components/email/email-compose";
import { StandardLayout } from "@/components/common/standard-layout";

function ComposeContent() {
  return (
    <StandardLayout>
      <div className="h-full overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-4 text-xl font-semibold md:mb-6 md:text-2xl">Compose</h1>
          <EmailCompose />
        </div>
      </div>
    </StandardLayout>
  );
}

export default function ComposePage() {
  return (
    <Suspense>
      <ComposeContent />
    </Suspense>
  );
}
