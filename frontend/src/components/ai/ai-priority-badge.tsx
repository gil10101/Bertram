"use client";

import { cn } from "@/lib/utils";

interface AiPriorityBadgeProps {
  priority: "high" | "medium" | "low";
  className?: string;
}

export function AiPriorityBadge({ priority, className }: AiPriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        priority === "high" && "bg-paprika-50 text-paprika-700 dark:bg-paprika-800/30 dark:text-paprika-300",
        priority === "medium" && "bg-floral-500/20 text-floral-800 dark:bg-floral-700/20 dark:text-floral-600",
        priority === "low" && "bg-dust-50 text-charcoal-300 dark:bg-charcoal-400/20 dark:text-dust-400",
        className
      )}
    >
      {priority}
    </span>
  );
}
