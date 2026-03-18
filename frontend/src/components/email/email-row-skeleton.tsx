import { cn } from "@/lib/utils";

const VARIANTS = [
  { sender: "w-[120px]", subject: "w-[200px]" },
  { sender: "w-[96px]", subject: "w-[240px]" },
  { sender: "w-[144px]", subject: "w-[160px]" },
];

interface EmailRowSkeletonProps {
  delay?: number;
  variant?: number;
}

export function EmailRowSkeleton({ delay = 0, variant = 0 }: EmailRowSkeletonProps) {
  const v = VARIANTS[variant % VARIANTS.length];

  return (
    <div
      className="flex animate-pulse items-start gap-3 border-b border-sidebar border-l-2 border-l-transparent px-4 py-3"
      style={{ animationDelay: `${delay * 75}ms` }}
    >
      {/* Avatar */}
      <div className="h-9 w-9 shrink-0 rounded-full bg-muted" />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className={cn("h-3.5 rounded bg-muted", v.sender)} />
        <div className={cn("mt-2 h-3 rounded bg-muted opacity-60", v.subject)} />
      </div>

      {/* Right side */}
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <div className="h-3 w-[48px] rounded bg-muted" />
        <div className="h-2 w-2 rounded-full bg-muted" />
      </div>
    </div>
  );
}
