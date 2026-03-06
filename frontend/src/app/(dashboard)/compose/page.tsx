"use client";

import { Suspense } from "react";
import { EmailCompose } from "@/components/email/email-compose";

export default function ComposePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-xl font-semibold md:mb-6 md:text-2xl">Compose</h1>
      <Suspense>
        <EmailCompose />
      </Suspense>
    </div>
  );
}
