"use client";

import { useShortcutsContext } from "./shortcuts-provider";

export function SequenceIndicator() {
  const { sequenceKey } = useShortcutsContext();

  if (!sequenceKey) return null;

  return (
    <div className="sequence-indicator">
      <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-xs font-medium text-foreground">
        {sequenceKey.toUpperCase()}
      </kbd>
      <span>waiting for next key...</span>
    </div>
  );
}
