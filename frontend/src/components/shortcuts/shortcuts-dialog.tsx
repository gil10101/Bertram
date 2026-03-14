"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  keyboardShortcuts,
  getDisplayKeysForShortcut,
  SCOPE_LABELS,
  SCOPE_PRIORITY,
} from "@/config/shortcuts";

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function KeyBadge({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-[11px] font-medium text-muted-foreground">
      {children}
    </kbd>
  );
}

export function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  const scopes = SCOPE_PRIORITY.filter((scope) =>
    keyboardShortcuts.some((s) => s.scope === scope),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-2">
          {scopes.map((scope) => {
            const shortcuts = keyboardShortcuts.filter(
              (s) => s.scope === scope,
            );
            // Deduplicate by action (Shift+I and R both do markAsRead)
            const seen = new Set<string>();
            const uniqueShortcuts = shortcuts.filter((s) => {
              if (seen.has(s.action)) return false;
              seen.add(s.action);
              return true;
            });

            return (
              <div key={scope}>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {SCOPE_LABELS[scope] ?? scope}
                </h3>
                <div className="flex flex-col gap-2">
                  {uniqueShortcuts.map((shortcut) => {
                    const displayKeys = getDisplayKeysForShortcut(shortcut);
                    return (
                      <div
                        key={shortcut.action}
                        className="flex items-center justify-between gap-4"
                      >
                        <span className="text-sm text-foreground">
                          {shortcut.description}
                        </span>
                        <div className="flex shrink-0 items-center gap-1">
                          {shortcut.type === "sequence" ? (
                            <>
                              <KeyBadge>{displayKeys[0]}</KeyBadge>
                              <span className="text-[10px] text-muted-foreground">
                                then
                              </span>
                              <KeyBadge>{displayKeys[1]}</KeyBadge>
                            </>
                          ) : (
                            displayKeys.map((key, i) => (
                              <KeyBadge key={i}>{key}</KeyBadge>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
