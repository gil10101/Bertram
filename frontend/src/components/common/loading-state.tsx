import { Skeleton } from "@/components/ui/skeleton";
import { EmailRowSkeleton } from "@/components/email/email-row-skeleton";
import { MeetingCardSkeleton } from "@/components/meetings/meeting-card-skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  className?: string;
  type?: "email-list" | "meeting-list" | "generic";
}

export function LoadingState({ className, type = "generic" }: LoadingStateProps) {
  if (type === "email-list") {
    return (
      <div className={className}>
        {Array.from({ length: 8 }, (_, i) => (
          <EmailRowSkeleton key={i} delay={i} variant={i % 3} />
        ))}
      </div>
    );
  }

  if (type === "meeting-list") {
    return (
      <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
        {Array.from({ length: 4 }, (_, i) => (
          <MeetingCardSkeleton key={i} delay={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-[75%]" />
    </div>
  );
}
