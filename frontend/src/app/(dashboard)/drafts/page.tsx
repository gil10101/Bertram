"use client";

import { useRouter } from "next/navigation";
import { useDrafts } from "@/hooks/use-drafts";
import { FileText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function DraftsPage() {
  const { drafts, isLoading, error, deleteDraft } = useDrafts();
  const router = useRouter();

  const handleOpen = (id: string) => {
    router.push(`/compose?draft=${id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteDraft(id);
    } catch {
      // ignore
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Drafts</h1>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg bg-muted/40"
            />
          ))}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!isLoading && !error && drafts.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <FileText className="h-10 w-10" />
          <p className="text-sm">No drafts yet</p>
        </div>
      )}

      {!isLoading &&
        drafts.map((draft) => (
          <button
            key={draft.id}
            type="button"
            onClick={() => handleOpen(draft.id)}
            className={cn(
              "flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/50",
            )}
          >
            <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {draft.subject || "(no subject)"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {draft.to.length > 0
                  ? `To: ${draft.to.join(", ")}`
                  : "(no recipients)"}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatDate(draft.updated_at)}
            </span>
            <button
              type="button"
              onClick={(e) => handleDelete(e, draft.id)}
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label="Delete draft"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </button>
        ))}
    </div>
    </div>
  );
}
