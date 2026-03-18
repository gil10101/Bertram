"use client";

import { Command } from "cmdk";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useRouter } from "next/navigation";
import { useCompose } from "@/components/common/compose-provider";
import {
  Inbox,
  FileText,
  Trash2,
  Calendar,
  Settings,
  Pen,
  Sparkles,
  Search,
  ChevronDown,
  ChevronUp,
  CornerDownLeft,
  Star,
  Archive,
  Tag,
  Mail,
  MailOpen,
  Reply,
  ReplyAll,
  Forward,
  ArrowLeft,
  Send,
  Keyboard,
} from "lucide-react";
import { isMac } from "@/lib/platform";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { openCompose } = useCompose();
  const mod = isMac ? "\u2318" : "Ctrl";

  const runAction = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command palette"
    >
      <VisuallyHidden.Root asChild>
        <DialogPrimitive.Title>Command palette</DialogPrimitive.Title>
      </VisuallyHidden.Root>
      <Command.Input
        placeholder="Type a command or search..."
        autoFocus
      />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>

        {/* ---- Navigation ---- */}
        <Command.Group heading="Navigation">
          <Command.Item onSelect={() => runAction(() => router.push("/inbox"))}>
            <Inbox className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Go to Inbox</span>
            <ShortcutHint keys={["G", "I"]} />
          </Command.Item>
          <Command.Item onSelect={() => runAction(() => router.push("/inbox?view=drafts"))}>
            <FileText className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Go to Drafts</span>
            <ShortcutHint keys={["G", "D"]} />
          </Command.Item>
          <Command.Item onSelect={() => runAction(() => router.push("/inbox?folder=TRASH"))}>
            <Trash2 className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Go to Bin</span>
            <ShortcutHint keys={["G", "T"]} />
          </Command.Item>
          <Command.Item onSelect={() => runAction(() => router.push("/meetings"))}>
            <Calendar className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Go to Meetings</span>
            <ShortcutHint keys={["G", "M"]} />
          </Command.Item>
          <Command.Item onSelect={() => runAction(() => router.push("/settings"))}>
            <Settings className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Go to Settings</span>
            <ShortcutHint keys={["G", "S"]} />
          </Command.Item>
        </Command.Group>

        <Command.Separator />

        {/* ---- Actions ---- */}
        <Command.Group heading="Actions">
          <Command.Item onSelect={() => runAction(() => openCompose())}>
            <Pen className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Compose New Email</span>
            <ShortcutHint keys={["C"]} />
          </Command.Item>
          <Command.Item
            onSelect={() =>
              runAction(() => {
                const input = document.querySelector<HTMLInputElement>(
                  '[placeholder="Search"]',
                );
                input?.focus();
              })
            }
          >
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Search Emails</span>
            <ShortcutHint keys={["/"]} />
          </Command.Item>
          <Command.Item disabled>
            <Keyboard className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Show Keyboard Shortcuts</span>
            <ShortcutHint keys={["?"]} />
          </Command.Item>
        </Command.Group>

        <Command.Separator />

        {/* ---- Mail List (shortcut reference) ---- */}
        <Command.Group heading="Mail List">
          <Command.Item disabled>
            <ChevronDown className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Next Email</span>
            <ShortcutHint keys={["J"]} />
          </Command.Item>
          <Command.Item disabled>
            <ChevronUp className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Previous Email</span>
            <ShortcutHint keys={["K"]} />
          </Command.Item>
          <Command.Item disabled>
            <CornerDownLeft className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Open Email</span>
            <ShortcutHint keys={["\u21B5"]} />
          </Command.Item>
          <Command.Item disabled>
            <Star className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Star / Unstar</span>
            <ShortcutHint keys={["S"]} />
          </Command.Item>
          <Command.Item disabled>
            <Archive className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Archive</span>
            <ShortcutHint keys={["E"]} />
          </Command.Item>
          <Command.Item disabled>
            <Trash2 className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Delete</span>
            <ShortcutHint keys={["D"]} />
          </Command.Item>
          <Command.Item disabled>
            <MailOpen className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Mark as Read</span>
            <ShortcutHint keys={["R"]} />
          </Command.Item>
          <Command.Item disabled>
            <Mail className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Mark as Unread</span>
            <ShortcutHint keys={["U"]} />
          </Command.Item>
          <Command.Item disabled>
            <Tag className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Label</span>
            <ShortcutHint keys={["L"]} />
          </Command.Item>
          <Command.Item disabled>
            <Inbox className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Select / Deselect</span>
            <ShortcutHint keys={["X"]} />
          </Command.Item>
          <Command.Item disabled>
            <Inbox className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Select All</span>
            <ShortcutHint keys={[mod, "A"]} />
          </Command.Item>
        </Command.Group>

        <Command.Separator />

        {/* ---- Email View (shortcut reference) ---- */}
        <Command.Group heading="Email View">
          <Command.Item disabled>
            <Reply className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Reply</span>
            <ShortcutHint keys={["R"]} />
          </Command.Item>
          <Command.Item disabled>
            <ReplyAll className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Reply All</span>
            <ShortcutHint keys={["A"]} />
          </Command.Item>
          <Command.Item disabled>
            <Forward className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Forward</span>
            <ShortcutHint keys={["F"]} />
          </Command.Item>
          <Command.Item disabled>
            <Archive className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Archive</span>
            <ShortcutHint keys={["E"]} />
          </Command.Item>
          <Command.Item disabled>
            <ArrowLeft className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Back to List</span>
            <ShortcutHint keys={["Esc"]} />
          </Command.Item>
        </Command.Group>

        <Command.Separator />

        {/* ---- Compose (shortcut reference) ---- */}
        <Command.Group heading="Compose">
          <Command.Item disabled>
            <Send className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">Send Email</span>
            <ShortcutHint keys={[mod, "\u21B5"]} />
          </Command.Item>
        </Command.Group>

        <Command.Separator />

        {/* ---- AI ---- */}
        <Command.Group heading="AI">
          <Command.Item onSelect={() => runAction(() => router.push("/inbox"))}>
            <Sparkles className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">AI Prioritize Inbox</span>
            <ShortcutHint keys={["P"]} />
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}

function ShortcutHint({ keys }: { keys: string[] }) {
  return (
    <div className="ml-auto flex items-center gap-0.5">
      {keys.map((key, i) => (
        <kbd
          key={i}
          className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[10px] text-muted-foreground"
        >
          {key}
        </kbd>
      ))}
    </div>
  );
}
