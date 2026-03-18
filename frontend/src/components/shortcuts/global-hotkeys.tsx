"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCompose } from "@/components/common/compose-provider";
import { useHotkeys } from "@/hooks/use-hotkeys";

interface GlobalHotkeysProps {
  onOpenShortcuts: () => void;
  onOpenCommandPalette: () => void;
}

export function GlobalHotkeys({
  onOpenShortcuts,
  onOpenCommandPalette,
}: GlobalHotkeysProps) {
  const router = useRouter();
  const { openCompose } = useCompose();

  const focusSearch = useCallback(() => {
    const input = document.querySelector<HTMLInputElement>(
      '[placeholder="Search"]',
    );
    input?.focus();
  }, []);

  // Global scope
  useHotkeys(
    {
      commandPalette: onOpenCommandPalette,
      newEmail: () => openCompose(),
      focusSearch,
      helpWithShortcuts: onOpenShortcuts,
    },
    "global",
  );

  // Navigation scope
  useHotkeys(
    {
      inbox: () => router.push("/inbox"),
      goToDrafts: () => router.push("/inbox?view=drafts"),
      goToTrash: () => router.push("/inbox?folder=TRASH"),
      goToMeetings: () => router.push("/meetings"),
      goToSettings: () => router.push("/settings"),
    },
    "navigation",
  );

  return null;
}
