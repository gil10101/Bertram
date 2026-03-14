"use client";

import { useHotkeys } from "@/hooks/use-hotkeys";

interface ComposeHotkeysProps {
  onSend: () => void;
  onClose: () => void;
  enabled: boolean;
}

export function ComposeHotkeys({
  onSend,
  onClose,
  enabled,
}: ComposeHotkeysProps) {
  useHotkeys(
    {
      sendEmail: onSend,
      closeCompose: onClose,
    },
    "compose",
    enabled,
  );

  return null;
}
