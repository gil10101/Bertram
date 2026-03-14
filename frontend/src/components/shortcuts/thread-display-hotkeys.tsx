"use client";

import { useHotkeys } from "@/hooks/use-hotkeys";

interface ThreadDisplayHotkeysProps {
  onReply: () => void;
  onReplyAll: () => void;
  onForward: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onBack: () => void;
  enabled: boolean;
}

export function ThreadDisplayHotkeys({
  onReply,
  onReplyAll,
  onForward,
  onArchive,
  onDelete,
  onBack,
  enabled,
}: ThreadDisplayHotkeysProps) {
  useHotkeys(
    {
      reply: onReply,
      replyAll: onReplyAll,
      forward: onForward,
      archive: onArchive,
      delete: onDelete,
      back: onBack,
    },
    "thread-display",
    enabled,
  );

  return null;
}
