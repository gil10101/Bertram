"use client";

import { useCallback, useRef, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createApiClient } from "@/lib/api-client";
import type { Editor } from "@tiptap/react";

interface UseAutoCompleteOptions {
  editor: Editor | null;
  subject?: string;
  enabled?: boolean;
  debounceMs?: number;
}

export function useAutoComplete({
  editor,
  subject = "",
  enabled = true,
  debounceMs = 800,
}: UseAutoCompleteOptions) {
  const { getToken } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generationRef = useRef(0);

  const fetchCompletion = useCallback(
    async (textBeforeCursor: string) => {
      if (!textBeforeCursor.trim() || !editor || editor.isDestroyed) return;

      const generation = ++generationRef.current;

      try {
        const api = createApiClient(getToken);
        const result = await api.post<{ completion: string }>("/ai/autocomplete", {
          text_before_cursor: textBeforeCursor,
          subject,
        });

        // Only apply if this is still the latest request
        if (generation !== generationRef.current) return;
        if (result.completion && editor && !editor.isDestroyed) {
          editor.commands.setGhostText(result.completion);
        }
      } catch {
        // Silently fail for autocomplete
      }
    },
    [getToken, subject, editor],
  );

  useEffect(() => {
    if (!editor || !enabled) return;

    const handleUpdate = () => {
      // Clear existing timer
      if (timerRef.current) clearTimeout(timerRef.current);

      // Invalidate in-flight requests
      generationRef.current++;

      // Check if cursor is near the end of content (no meaningful text after cursor)
      const { from } = editor.state.selection;
      const textAfter = editor.state.doc.textBetween(
        from,
        editor.state.doc.content.size,
        "\n",
      );
      if (textAfter.trim().length > 0) return;

      // Get text before cursor
      const textBefore = editor.state.doc.textBetween(0, from, "\n");
      if (!textBefore.trim()) return;

      // Debounce
      timerRef.current = setTimeout(() => {
        fetchCompletion(textBefore);
      }, debounceMs);
    };

    editor.on("update", handleUpdate);
    const gen = generationRef;

    return () => {
      editor.off("update", handleUpdate);
      if (timerRef.current) clearTimeout(timerRef.current);
      gen.current++;
    };
  }, [editor, enabled, debounceMs, fetchCompletion]);
}
