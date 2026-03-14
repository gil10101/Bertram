import { keyboardLayoutMapper } from "@/utils/keyboard-layout-map";
import { getKeyCodeFromKey } from "@/utils/keyboard-utils";
import { isMac } from "@/lib/platform";

export interface Shortcut {
  keys: string[];
  action: string;
  type: "single" | "sequence" | "combination";
  description: string;
  scope: string;
  preventDefault?: boolean;
}

export interface EnhancedShortcut extends Shortcut {
  displayKeys?: string[];
  mappedKeys?: string[];
}

export function getDisplayKeysForShortcut(shortcut: Shortcut): string[] {
  const detectedLayout = keyboardLayoutMapper.getDetectedLayout();

  return shortcut.keys.map((key) => {
    switch (key.toLowerCase()) {
      case "mod":
        return isMac ? "\u2318" : "Ctrl";
      case "meta":
        return "\u2318";
      case "ctrl":
      case "control":
        return "Ctrl";
      case "alt":
        return isMac ? "\u2325" : "Alt";
      case "shift":
        return "\u21E7";
      case "escape":
        return "Esc";
      case "backspace":
        return "\u232B";
      case "enter":
        return "\u21B5";
      case "space":
        return "Space";
      default:
        if (detectedLayout?.layout && detectedLayout.layout !== "qwerty") {
          const keyCode = getKeyCodeFromKey(key);
          const mappedKey = keyboardLayoutMapper.getKeyForCode(keyCode);
          return mappedKey.length === 1 ? mappedKey.toUpperCase() : mappedKey;
        }
        return key.length === 1 ? key.toUpperCase() : key;
    }
  });
}

export function enhanceShortcutsWithMapping(
  shortcuts: Shortcut[],
): EnhancedShortcut[] {
  return shortcuts.map((shortcut) => ({
    ...shortcut,
    displayKeys: getDisplayKeysForShortcut(shortcut),
    mappedKeys: keyboardLayoutMapper.mapKeys(
      shortcut.keys.map(getKeyCodeFromKey),
    ),
  }));
}

// --- Scope definitions ---

const globalShortcuts: Shortcut[] = [
  {
    keys: ["mod", "k"],
    action: "commandPalette",
    type: "combination",
    description: "Open command palette",
    scope: "global",
    preventDefault: true,
  },
  {
    keys: ["c"],
    action: "newEmail",
    type: "single",
    description: "Compose new email",
    scope: "global",
    preventDefault: true,
  },
  {
    keys: ["/"],
    action: "focusSearch",
    type: "single",
    description: "Focus search",
    scope: "global",
    preventDefault: true,
  },
  {
    keys: ["shift", "/"],
    action: "helpWithShortcuts",
    type: "combination",
    description: "Show keyboard shortcuts",
    scope: "global",
  },
];

const navigationShortcuts: Shortcut[] = [
  {
    keys: ["g", "i"],
    action: "inbox",
    type: "sequence",
    description: "Go to inbox",
    scope: "navigation",
  },
  {
    keys: ["g", "d"],
    action: "goToDrafts",
    type: "sequence",
    description: "Go to drafts",
    scope: "navigation",
  },
  {
    keys: ["g", "t"],
    action: "goToTrash",
    type: "sequence",
    description: "Go to trash",
    scope: "navigation",
  },
  {
    keys: ["g", "m"],
    action: "goToMeetings",
    type: "sequence",
    description: "Go to meetings",
    scope: "navigation",
  },
  {
    keys: ["g", "s"],
    action: "goToSettings",
    type: "sequence",
    description: "Go to settings",
    scope: "navigation",
  },
];

const mailListShortcuts: Shortcut[] = [
  {
    keys: ["j"],
    action: "navigateDown",
    type: "single",
    description: "Next email",
    scope: "mail-list",
  },
  {
    keys: ["k"],
    action: "navigateUp",
    type: "single",
    description: "Previous email",
    scope: "mail-list",
  },
  {
    keys: ["enter"],
    action: "openEmail",
    type: "single",
    description: "Open email",
    scope: "mail-list",
  },
  {
    keys: ["e"],
    action: "archiveEmail",
    type: "single",
    description: "Archive",
    scope: "mail-list",
  },
  {
    keys: ["s"],
    action: "starEmail",
    type: "single",
    description: "Star / unstar",
    scope: "mail-list",
  },
  {
    keys: ["r"],
    action: "markAsRead",
    type: "single",
    description: "Mark as read",
    scope: "mail-list",
  },
  {
    keys: ["u"],
    action: "markAsUnread",
    type: "single",
    description: "Mark as unread",
    scope: "mail-list",
  },
  {
    keys: ["shift", "i"],
    action: "markAsRead",
    type: "combination",
    description: "Mark as read",
    scope: "mail-list",
  },
  {
    keys: ["shift", "u"],
    action: "markAsUnread",
    type: "combination",
    description: "Mark as unread",
    scope: "mail-list",
  },
  {
    keys: ["d"],
    action: "deleteEmail",
    type: "single",
    description: "Delete",
    scope: "mail-list",
  },
  {
    keys: ["l"],
    action: "labelEmail",
    type: "single",
    description: "Label",
    scope: "mail-list",
  },
  {
    keys: ["x"],
    action: "toggleSelect",
    type: "single",
    description: "Select / deselect",
    scope: "mail-list",
  },
  {
    keys: ["mod", "a"],
    action: "selectAll",
    type: "combination",
    description: "Select all",
    scope: "mail-list",
    preventDefault: true,
  },
  {
    keys: ["escape"],
    action: "exitSelectionMode",
    type: "single",
    description: "Exit selection",
    scope: "mail-list",
  },
  {
    keys: ["p"],
    action: "aiPrioritize",
    type: "single",
    description: "AI prioritize",
    scope: "mail-list",
  },
];

const threadDisplayShortcuts: Shortcut[] = [
  {
    keys: ["r"],
    action: "reply",
    type: "single",
    description: "Reply",
    scope: "thread-display",
  },
  {
    keys: ["a"],
    action: "replyAll",
    type: "single",
    description: "Reply all",
    scope: "thread-display",
  },
  {
    keys: ["f"],
    action: "forward",
    type: "single",
    description: "Forward",
    scope: "thread-display",
  },
  {
    keys: ["e"],
    action: "archive",
    type: "single",
    description: "Archive",
    scope: "thread-display",
  },
  {
    keys: ["meta", "backspace"],
    action: "delete",
    type: "combination",
    description: "Delete",
    scope: "thread-display",
  },
  {
    keys: ["escape"],
    action: "back",
    type: "single",
    description: "Back to list",
    scope: "thread-display",
  },
];

const composeShortcuts: Shortcut[] = [
  {
    keys: ["mod", "enter"],
    action: "sendEmail",
    type: "combination",
    description: "Send email",
    scope: "compose",
    preventDefault: true,
  },
  {
    keys: ["escape"],
    action: "closeCompose",
    type: "single",
    description: "Close compose",
    scope: "compose",
  },
];

export const keyboardShortcuts: Shortcut[] = [
  ...globalShortcuts,
  ...navigationShortcuts,
  ...mailListShortcuts,
  ...threadDisplayShortcuts,
  ...composeShortcuts,
];

export const enhancedKeyboardShortcuts: EnhancedShortcut[] =
  enhanceShortcutsWithMapping(keyboardShortcuts);

/** Scope priority order — higher index wins when multiple scopes are active */
export const SCOPE_PRIORITY: string[] = [
  "global",
  "navigation",
  "mail-list",
  "thread-display",
  "compose",
];

/** Scope display names for the help dialog */
export const SCOPE_LABELS: Record<string, string> = {
  global: "Global",
  navigation: "Navigation",
  "mail-list": "Mail List",
  "thread-display": "Email View",
  compose: "Compose",
};
