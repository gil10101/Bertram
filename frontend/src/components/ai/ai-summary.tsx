"use client";

import { useState } from "react";
import { useAiSummary } from "@/hooks/use-ai-action";
import { ProgressiveText } from "./progressive-text";
import { cn } from "@/lib/utils";

interface AiSummaryProps {
  emailId: string;
  provider?: string;
}

export function AiSummary({ emailId, provider }: AiSummaryProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { data, isLoading, error, execute } = useAiSummary(emailId, provider);

  const handleSummarize = () => {
    execute(emailId);
    setIsOpen(true);
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-1 items-center gap-2 text-left text-sm font-medium hover:bg-accent/50"
        >
          <span>AI Summary</span>
          <span className={cn("text-xs transition-transform", isOpen && "rotate-180")}>▼</span>
        </button>
        <button
          type="button"
          onClick={handleSummarize}
          className="rounded px-2 py-1 text-xs font-medium text-paprika hover:bg-paprika/10"
        >
          Summarize
        </button>
      </div>
      {isOpen && (
        <div className="border-t border-border px-4 py-3">
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="animate-text-shimmer bg-[length:250%_100%] bg-clip-text text-transparent bg-[linear-gradient(110deg,hsl(var(--muted-foreground))_35%,hsl(var(--primary))_50%,hsl(var(--muted-foreground))_65%)]">
                Summarizing...
              </span>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error.message}</p>}
          {data && !isLoading && (
            <p className="text-sm">
              <ProgressiveText text={data} />
            </p>
          )}
          {!data && !isLoading && !error && (
            <p className="text-sm text-muted-foreground">Click Summarize to generate</p>
          )}
        </div>
      )}
    </div>
  );
}
