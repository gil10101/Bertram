import { Suspense } from "react";
import { FeedbackPage } from "@/components/feedback/feedback-page";

export default function FeatureRequestPage() {
  return (
    <Suspense>
      <FeedbackPage type="feature" />
    </Suspense>
  );
}
