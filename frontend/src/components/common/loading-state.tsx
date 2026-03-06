import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  className?: string;
  variant?: "spinner" | "skeleton";
}

export function LoadingState({ className, variant = "skeleton" }: LoadingStateProps) {
  if (variant === "spinner") {
    return (
      <div
        className={cn(
          "inline-block h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent",
          className
        )}
        role="status"
        aria-label="Loading"
      />
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
