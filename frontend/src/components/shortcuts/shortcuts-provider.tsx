"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  keyboardShortcuts,
  SCOPE_PRIORITY,
  type Shortcut,
} from "@/config/shortcuts";
import { isMac } from "@/lib/platform";

type ActionHandler = () => void;
type ScopeHandlers = Record<string, ActionHandler>;

interface ShortcutsContextValue {
  registerScope: (scope: string, handlers: ScopeHandlers) => void;
  unregisterScope: (scope: string) => void;
  sequenceKey: string | null;
}

const ShortcutsContext = createContext<ShortcutsContextValue>({
  registerScope: () => {},
  unregisterScope: () => {},
  sequenceKey: null,
});

export function useShortcutsContext() {
  return useContext(ShortcutsContext);
}

const SEQUENCE_TIMEOUT = 500;

function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (target.isContentEditable) return true;
  return false;
}

function hasModifier(shortcut: Shortcut): boolean {
  return shortcut.keys.some((k) =>
    ["mod", "meta", "ctrl", "control", "alt", "shift"].includes(
      k.toLowerCase(),
    ),
  );
}

function getKeyFromEvent(e: KeyboardEvent): string {
  return e.key.toLowerCase();
}

function matchesModifiers(shortcut: Shortcut, e: KeyboardEvent): boolean {
  const keys = shortcut.keys.map((k) => k.toLowerCase());
  const needsMod = keys.includes("mod");
  const needsMeta = keys.includes("meta");
  const needsCtrl = keys.includes("ctrl") || keys.includes("control");
  const needsAlt = keys.includes("alt");
  const needsShift = keys.includes("shift");

  // "mod" maps to metaKey on Mac, ctrlKey on Windows
  const modSatisfied = needsMod
    ? isMac
      ? e.metaKey
      : e.ctrlKey
    : true;
  const metaSatisfied = needsMeta ? e.metaKey : true;
  const ctrlSatisfied = needsCtrl ? e.ctrlKey : true;
  const altSatisfied = needsAlt ? e.altKey : true;
  const shiftSatisfied = needsShift ? e.shiftKey : true;

  // Also check no unwanted modifiers are pressed (for single-key shortcuts)
  if (!needsMod && !needsMeta && !needsCtrl && e.metaKey) return false;
  if (!needsMod && !needsCtrl && e.ctrlKey) return false;
  if (!needsAlt && e.altKey) return false;
  // Don't check unwanted shift for single keys — shift+letter is just uppercase

  return modSatisfied && metaSatisfied && ctrlSatisfied && altSatisfied && shiftSatisfied;
}

function getNonModifierKeys(shortcut: Shortcut): string[] {
  const modifiers = new Set(["mod", "meta", "ctrl", "control", "alt", "shift"]);
  return shortcut.keys
    .filter((k) => !modifiers.has(k.toLowerCase()))
    .map((k) => k.toLowerCase());
}

export function ShortcutsProvider({ children }: { children: React.ReactNode }) {
  const scopeHandlersRef = useRef<Map<string, ScopeHandlers>>(new Map());
  const sequenceKeyRef = useRef<string | null>(null);
  const sequenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sequenceKey, setSequenceKey] = useState<string | null>(null);

  const registerScope = useCallback(
    (scope: string, handlers: ScopeHandlers) => {
      scopeHandlersRef.current.set(scope, handlers);
    },
    [],
  );

  const unregisterScope = useCallback((scope: string) => {
    scopeHandlersRef.current.delete(scope);
  }, []);

  const clearSequence = useCallback(() => {
    sequenceKeyRef.current = null;
    setSequenceKey(null);
    if (sequenceTimerRef.current) {
      clearTimeout(sequenceTimerRef.current);
      sequenceTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const activeScopes = scopeHandlersRef.current;
      const inInput = isInputElement(e.target);
      const eventKey = getKeyFromEvent(e);

      // Get all shortcuts sorted by scope priority (highest first)
      const sortedScopes = [...activeScopes.entries()].sort(
        ([a], [b]) =>
          SCOPE_PRIORITY.indexOf(b) - SCOPE_PRIORITY.indexOf(a),
      );

      // Check for sequence completions first (second key of g+i etc.)
      if (sequenceKeyRef.current) {
        const firstKey = sequenceKeyRef.current;
        clearSequence();

        for (const [scope, handlers] of sortedScopes) {
          const scopeShortcuts = keyboardShortcuts.filter(
            (s) => s.scope === scope && s.type === "sequence",
          );

          for (const shortcut of scopeShortcuts) {
            if (
              shortcut.keys.length === 2 &&
              shortcut.keys[0].toLowerCase() === firstKey &&
              shortcut.keys[1].toLowerCase() === eventKey
            ) {
              const handler = handlers[shortcut.action];
              if (handler) {
                e.preventDefault();
                handler();
                return;
              }
            }
          }
        }
        // Sequence didn't match — fall through to normal matching
      }

      // Check for matches in priority order
      for (const [scope, handlers] of sortedScopes) {
        const scopeShortcuts = keyboardShortcuts.filter(
          (s) => s.scope === scope,
        );

        for (const shortcut of scopeShortcuts) {
          // Skip sequence shortcuts for first-key matching (handled below)
          if (shortcut.type === "sequence") continue;

          const hasMod = hasModifier(shortcut);

          // In input fields: only allow shortcuts with modifiers
          if (inInput && !hasMod) continue;

          if (!matchesModifiers(shortcut, e)) continue;

          const nonModKeys = getNonModifierKeys(shortcut);

          if (nonModKeys.length === 1) {
            // For "?" which is shift+/ — check e.key directly
            const targetKey = nonModKeys[0];
            const keyMatches =
              eventKey === targetKey ||
              e.key === targetKey ||
              e.key.toLowerCase() === targetKey;

            if (keyMatches) {
              const handler = handlers[shortcut.action];
              if (handler) {
                if (shortcut.preventDefault) e.preventDefault();
                handler();
                return; // Highest-priority scope wins
              }
            }
          }
        }
      }

      // Check if this key starts a sequence (only if not in input)
      if (!inInput) {
        const isSequenceStart = keyboardShortcuts.some(
          (s) =>
            s.type === "sequence" &&
            s.keys[0].toLowerCase() === eventKey &&
            // Only start sequence if the scope is registered
            activeScopes.has(s.scope),
        );

        if (isSequenceStart) {
          sequenceKeyRef.current = eventKey;
          setSequenceKey(eventKey);
          sequenceTimerRef.current = setTimeout(clearSequence, SEQUENCE_TIMEOUT);
          return;
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);
    };
  }, [clearSequence]);

  return (
    <ShortcutsContext.Provider
      value={{ registerScope, unregisterScope, sequenceKey }}
    >
      {children}
    </ShortcutsContext.Provider>
  );
}
