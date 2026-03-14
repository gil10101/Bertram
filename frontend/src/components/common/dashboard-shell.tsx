"use client";

import { useState } from "react";
import { ShortcutsProvider } from "@/components/shortcuts/shortcuts-provider";
import { GlobalHotkeys } from "@/components/shortcuts/global-hotkeys";
import { ShortcutsDialog } from "@/components/shortcuts/shortcuts-dialog";
import { CommandPalette } from "@/components/command-palette/command-palette";
import { SequenceIndicator } from "@/components/shortcuts/sequence-indicator";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  return (
    <ShortcutsProvider>
      <GlobalHotkeys
        onOpenShortcuts={() => setShortcutsOpen(true)}
        onOpenCommandPalette={() =>
          setCommandPaletteOpen((prev) => !prev)
        }
      />
      {children}
      <ShortcutsDialog
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
      />
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
      <SequenceIndicator />
    </ShortcutsProvider>
  );
}
