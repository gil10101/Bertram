"use client";

import { Mail, X } from "lucide-react";

interface NewEmailPreview {
  id: string;
  subject: string;
  sender: { name: string; email: string };
  snippet: string;
  provider?: string;
}

interface NewEmailBannerProps {
  count: number;
  emails: NewEmailPreview[];
  onDismiss: () => void;
}

export function NewEmailBanner({ count, emails, onDismiss }: NewEmailBannerProps) {
  const latestSender = emails[0]?.sender;

  return (
    <div className="flex items-center gap-3 rounded-lg bg-primary/20 px-4 py-3 text-sm animate-in slide-in-from-top-2 fade-in duration-300">
      <Mail className="h-4 w-4 shrink-0 text-primary" />
      <span className="font-medium text-foreground">
        {count === 1 ? "1 new email" : `${count} new emails`}
      </span>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-auto shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-primary/20 hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
