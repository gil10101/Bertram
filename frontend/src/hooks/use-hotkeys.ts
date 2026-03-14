"use client";

import { useEffect, useRef } from "react";
import { useShortcutsContext } from "@/components/shortcuts/shortcuts-provider";

type HotkeyActions = Record<string, () => void>;

/**
 * Register hotkey actions for a given scope.
 * The ShortcutsProvider owns the single keydown listener and dispatches
 * to the highest-priority active scope.
 */
export function useHotkeys(
  actions: HotkeyActions,
  scope: string,
  enabled: boolean = true,
) {
  const { registerScope, unregisterScope } = useShortcutsContext();
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  useEffect(() => {
    if (!enabled) {
      unregisterScope(scope);
      return;
    }

    // Wrap so the provider always calls the latest callbacks
    const wrappedHandlers: Record<string, () => void> = {};
    for (const key of Object.keys(actionsRef.current)) {
      wrappedHandlers[key] = () => actionsRef.current[key]?.();
    }

    registerScope(scope, wrappedHandlers);
    return () => unregisterScope(scope);
  }, [scope, enabled, registerScope, unregisterScope]);
}
