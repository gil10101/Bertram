import { Suspense } from "react";
import { FeedbackPage } from "@/components/feedback/feedback-page";

export default function ReportBugPage() {
  return (
    <Suspense>
      <FeedbackPage type="bug" />
    </Suspense>
  );
}
