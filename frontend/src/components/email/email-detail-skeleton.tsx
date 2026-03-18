export function EmailDetailSkeleton() {
  return (
    <div className="animate-pulse p-6">
      {/* Subject */}
      <div className="h-6 w-[300px] rounded bg-muted" />

      {/* Sender row */}
      <div className="mt-4 flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
        <div className="h-4 w-[140px] rounded bg-muted" />
        <div className="h-3 w-[80px] rounded bg-muted opacity-60" />
      </div>

      {/* Badge row */}
      <div className="mt-3 flex gap-2">
        <div className="h-5 w-[60px] rounded-full bg-muted" />
        <div className="h-5 w-[60px] rounded-full bg-muted" />
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-border" />

      {/* Body lines - paragraph 1 */}
      <div className="space-y-2.5">
        <div className="h-3.5 w-full rounded bg-muted" />
        <div className="h-3.5 w-[95%] rounded bg-muted" />
        <div className="h-3.5 w-[88%] rounded bg-muted" />
        <div className="h-3.5 w-full rounded bg-muted" />
        <div className="h-3.5 w-[72%] rounded bg-muted" />
      </div>

      {/* Body lines - paragraph 2 */}
      <div className="mt-6 space-y-2.5">
        <div className="h-3.5 w-[90%] rounded bg-muted" />
        <div className="h-3.5 w-[65%] rounded bg-muted" />
        <div className="h-3.5 w-[78%] rounded bg-muted" />
      </div>

      {/* Action bar */}
      <div className="mt-8 flex gap-2">
        <div className="h-8 w-[80px] rounded-md bg-muted" />
        <div className="h-8 w-[80px] rounded-md bg-muted" />
        <div className="h-8 w-[80px] rounded-md bg-muted" />
      </div>
    </div>
  );
}
