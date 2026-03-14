"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { useEffect, useImperativeHandle, forwardRef } from "react";
import { EditorToolbar } from "./editor-toolbar";
import { GhostText } from "@/extensions/ghost-text";
import { useAutoComplete } from "@/hooks/use-autocomplete";

export interface EmailEditorRef {
  getHTML: () => string;
  getText: () => string;
  setContent: (html: string) => void;
  clear: () => void;
  getEditor: () => ReturnType<typeof useEditor> | null;
}

interface EmailEditorProps {
  initialContent?: string;
  onUpdate?: (html: string) => void;
  placeholder?: string;
  subject?: string;
  autocomplete?: boolean;
}

export const EmailEditor = forwardRef<EmailEditorRef, EmailEditorProps>(
  function EmailEditor({ initialContent = "", onUpdate, placeholder, subject, autocomplete = true }, ref) {
    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: false,
          codeBlock: false,
          code: false,
          horizontalRule: false,
          blockquote: { HTMLAttributes: { class: "border-l-2 border-dust-400 pl-3 text-muted-foreground" } },
        }),
        Underline,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "text-paprika underline underline-offset-2 cursor-pointer",
          },
        }),
        GhostText,
      ],
      content: initialContent,
      editorProps: {
        attributes: {
          class:
            "prose prose-sm max-w-none px-3 py-2 min-h-[200px] outline-none text-foreground [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:my-0.5",
        },
      },
      onUpdate: ({ editor: e }) => {
        onUpdate?.(e.getHTML());
      },
    });

    useAutoComplete({ editor, subject, enabled: autocomplete });

    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() || "",
      getText: () => editor?.getText() || "",
      setContent: (html: string) => {
        editor?.commands.setContent(html);
      },
      clear: () => {
        editor?.commands.clearContent();
      },
      getEditor: () => editor,
    }));

    // Sync initial content when it changes externally (e.g. loading a draft)
    useEffect(() => {
      if (editor && initialContent && !editor.isFocused) {
        const currentContent = editor.getHTML();
        if (currentContent === "<p></p>" || currentContent === "") {
          editor.commands.setContent(initialContent);
        }
      }
    }, [editor, initialContent]);

    if (!editor) return null;

    const ghostStorage = (editor.extensionStorage as unknown as Record<string, Record<string, unknown>>)["ghostText"];
    const hasGhostText = !!(ghostStorage?.suggestion);

    return (
      <div className="rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <EditorToolbar editor={editor} />
        <EditorContent
          editor={editor}
          className={!editor.getText().trim() ? "[&_.ProseMirror_p:first-child]:before:pointer-events-none [&_.ProseMirror_p:first-child]:before:float-left [&_.ProseMirror_p:first-child]:before:h-0 [&_.ProseMirror_p:first-child]:before:text-muted-foreground [&_.ProseMirror_p:first-child]:before:content-[attr(data-placeholder)]" : ""}
          data-placeholder={placeholder}
        />
        {hasGhostText && (
          <div className="flex items-center gap-1.5 border-t border-border/50 px-3 py-1">
            <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Tab</kbd>
            <span className="text-[10px] text-muted-foreground">to accept</span>
            <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Esc</kbd>
            <span className="text-[10px] text-muted-foreground">to dismiss</span>
          </div>
        )}
      </div>
    );
  },
);
