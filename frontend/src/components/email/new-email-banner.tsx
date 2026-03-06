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

const PROVIDER_LABELS: Record<string, string> = {
  gmail: "Gmail",
  outlook: "Outlook",
};

function providerLabel(key?: string): string | null {
  if (!key) return null;
  return PROVIDER_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

export function NewEmailBanner({ count, emails, onDismiss }: NewEmailBannerProps) {
  const latestSender = emails[0]?.sender;
  const senderName = latestSender?.name || latestSender?.email || "Someone";

  // Collect distinct provider names
  const providers = [
    ...new Set(
      emails.map((e) => providerLabel(e.provider)).filter(Boolean) as string[]
    ),
  ];
  const providerText = providers.length > 0 ? providers.join(" & ") : null;

  return (
    <div className="flex max-w-lg items-center gap-3 rounded-lg bg-primary/10 px-4 py-3 text-sm animate-in slide-in-from-top-2 fade-in duration-300">
      <Mail className="h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        {count === 1 ? (
          <span>
            New email from <span className="font-medium">{senderName}</span>
            {providerText && (
              <span className="text-muted-foreground"> via {providerText}</span>
            )}
            {emails[0]?.subject && (
              <>
                {" "}&mdash; <span className="text-muted-foreground">{emails[0].subject}</span>
              </>
            )}
          </span>
        ) : (
          <span>
            <span className="font-medium">{count} new emails</span>
            {providerText && (
              <span className="text-muted-foreground"> via {providerText}</span>
            )}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
