"use client";

import { useState, useEffect, useCallback } from "react";
import { useAiDraft } from "@/hooks/use-ai-action";
import { ProgressiveText } from "./progressive-text";
import { cn } from "@/lib/utils";

interface AiDraftProps {
  emailId: string;
  provider?: string;
}

export function AiDraft({ emailId, provider }: AiDraftProps) {
  const [draft, setDraft] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);
  const { data, isLoading, error, execute } = useAiDraft(emailId, provider);

  useEffect(() => {
    if (data) {
      setDraft(data);
      setIsRevealed(false);
    }
  }, [data]);

  const handleRevealComplete = useCallback(() => {
    setIsRevealed(true);
  }, []);

  const handleGenerate = () => {
    execute(emailId);
  };

  return (
    <div className="mt-4 flex flex-col gap-3">
      {!data && !isLoading && (
        <button
          type="button"
          onClick={handleGenerate}
          className="w-fit rounded-md border border-paprika/30 bg-background px-3 py-1.5 text-sm font-medium text-paprika hover:bg-paprika/10"
        >
          Generate Draft
        </button>
      )}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Generating draft...
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error.message}</p>}
      {(data || draft) && (
        isRevealed ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={cn(
              "min-h-[120px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm",
              "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
            placeholder="AI-generated draft..."
          />
        ) : (
          <div
            className={cn(
              "min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm whitespace-pre-wrap",
            )}
          >
            <ProgressiveText text={draft} wordDelay={20} onComplete={handleRevealComplete} />
          </div>
        )
      )}
    </div>
  );
}
