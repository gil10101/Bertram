"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Link,
  List,
  ListOrdered,
  Unlink,
} from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40",
        active && "bg-accent text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-0.5 h-5 w-px bg-border" />;
}

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [linkInput, setLinkInput] = useState("");
  const [showLinkForm, setShowLinkForm] = useState(false);

  const handleLinkSubmit = useCallback(() => {
    if (!editor) return;
    const url = linkInput.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const href = url.match(/^https?:\/\//) ? url : `https://${url}`;
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
    setLinkInput("");
    setShowLinkForm(false);
  }, [editor, linkInput]);

  const openLinkForm = useCallback(() => {
    if (!editor) return;
    const existing = editor.getAttributes("link").href || "";
    setLinkInput(existing);
    setShowLinkForm(true);
  }, [editor]);

  if (!editor) return null;

  const iconSize = "h-4 w-4";

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold"
      >
        <Bold className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic"
      >
        <Italic className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Underline"
      >
        <Underline className={iconSize} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        onClick={openLinkForm}
        active={editor.isActive("link")}
        title="Insert link"
      >
        <Link className={iconSize} />
      </ToolbarButton>
      {editor.isActive("link") && (
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          title="Remove link"
        >
          <Unlink className={iconSize} />
        </ToolbarButton>
      )}

      <ToolbarDivider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet list"
      >
        <List className={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Numbered list"
      >
        <ListOrdered className={iconSize} />
      </ToolbarButton>

      {showLinkForm && (
        <div className="mt-1 flex w-full items-center gap-2">
          <input
            type="url"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleLinkSubmit();
              }
              if (e.key === "Escape") setShowLinkForm(false);
            }}
            placeholder="https://example.com"
            className="flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
          <button
            type="button"
            onClick={handleLinkSubmit}
            className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => setShowLinkForm(false)}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
