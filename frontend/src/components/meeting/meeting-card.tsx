"use client";

import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
import type { Meeting } from "@/types/meeting";

const PROVIDER_COLORS: Record<string, { bg: string; badge: string; label: string }> = {
  google: { bg: "bg-blue-500", badge: "bg-blue-500/10 text-blue-700 dark:text-blue-400", label: "Google" },
  outlook: { bg: "bg-orange-500", badge: "bg-orange-500/10 text-orange-700 dark:text-orange-400", label: "Outlook" },
  bertram: { bg: "bg-primary", badge: "bg-primary/10 text-primary", label: "Bertram" },
};

function getProviders(meeting: Meeting): string[] {
  if (meeting.providers && meeting.providers.length > 0) return meeting.providers;
  return [meeting.source || "bertram"];
}

function ProviderStripe() {
  return (
    <div className="absolute inset-y-0 left-0 w-1 rounded-l-lg bg-muted-foreground/30" />
  );
}

function ProviderBadges({ providers }: { providers: string[] }) {
  return (
    <div className="flex items-center gap-1">
      {providers.map((p) => {
        const colors = PROVIDER_COLORS[p] ?? PROVIDER_COLORS.bertram;
        return (
          <span
            key={p}
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-medium",
              colors.badge,
            )}
          >
            {colors.label}
          </span>
        );
      })}
    </div>
  );
}

interface MeetingCardProps {
  meeting: Meeting;
  className?: string;
  onClick?: () => void;
}

export function MeetingCard({ meeting, className, onClick }: MeetingCardProps) {
  const start = new Date(meeting.start_time);
  const end = new Date(meeting.end_time);
  const timeStr = `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  const dateStr = start.toLocaleDateString();
  const providers = getProviders(meeting);

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative cursor-pointer rounded-lg border border-border bg-card p-4 pl-5 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <ProviderStripe />
      <div className="flex items-start justify-between">
        <h3 className="font-semibold">{meeting.title}</h3>
        <ProviderBadges providers={providers} />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{dateStr} · {timeStr}</p>
      {meeting.location && (
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {meeting.location}
        </p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">
        {meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export { ProviderStripe, ProviderBadges, getProviders, PROVIDER_COLORS };
