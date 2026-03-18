interface MeetingCardSkeletonProps {
  delay?: number;
}

export function MeetingCardSkeleton({ delay = 0 }: MeetingCardSkeletonProps) {
  return (
    <div
      className="relative animate-pulse rounded-lg border border-border bg-card p-4 pl-5"
      style={{ animationDelay: `${delay * 75}ms` }}
    >
      {/* Left stripe */}
      <div className="absolute inset-y-0 left-0 w-1 rounded-l-lg bg-muted/40" />

      {/* Title */}
      <div className="h-4 w-[160px] rounded bg-muted" />

      {/* Date/time */}
      <div className="mt-2 h-3 w-[180px] rounded bg-muted opacity-70" />

      {/* Location */}
      <div className="mt-2 h-3 w-[100px] rounded bg-muted opacity-50" />

      {/* Attendees */}
      <div className="mt-2 h-3 w-[80px] rounded bg-muted opacity-50" />
    </div>
  );
}
