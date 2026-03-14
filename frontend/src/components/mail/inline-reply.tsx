"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createApiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Archive,
  File,
  MessageSquare,
  Reply,
  ReplyAll,
  Forward,
  Send,
} from "lucide-react";
import type { ComposeMode } from "@/types/email";
import { useComposeChat } from "@/hooks/use-compose-chat";
import { EmailEditor, type EmailEditorRef } from "@/components/email/editor";
import { ComposeChat } from "@/components/ai/compose-chat";

const MAX_TOTAL_SIZE = 25 * 1024 * 1024; // 25 MB

const MODE_LABELS: Record<ComposeMode, string> = {
  new: "New Message",
  reply: "Reply",
  replyAll: "Reply All",
  forward: "Forward",
};

const MODE_ICONS: Record<ComposeMode, React.ElementType> = {
  new: Send,
  reply: Reply,
  replyAll: ReplyAll,
  forward: Forward,
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ type }: { type: string }) {
  const cls = "h-4 w-4 shrink-0";
  if (type.startsWith("image/")) return <ImageIcon className={cls} />;
  if (type.startsWith("video/")) return <Film className={cls} />;
  if (type.startsWith("audio/")) return <Music className={cls} />;
  if (type === "application/pdf" || type.includes("document") || type.includes("text"))
    return <FileText className={cls} />;
  if (type.includes("zip") || type.includes("compressed"))
    return <Archive className={cls} />;
  return <File className={cls} />;
}

interface InlineReplyProps {
  mode: ComposeMode;
  to: string;
  cc: string;
  subject: string;
  quotedBody: string;
  threadId?: string;
  inReplyTo?: string;
  references?: string;
  emailId: string;
  provider?: string;
  onSent: () => void;
  onDiscard: () => void;
  onModeChange?: (mode: ComposeMode) => void;
}

export function InlineReply({
  mode,
  to: initialTo,
  cc: initialCc,
  subject,
  quotedBody,
  threadId,
  inReplyTo,
  references,
  emailId,
  provider,
  onSent,
  onDiscard,
  onModeChange,
}: InlineReplyProps) {
  const { getToken } = useAuth();

  const [to, setTo] = useState(initialTo);
  const [cc, setCc] = useState(initialCc);
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showCcField, setShowCcField] = useState(!!initialCc);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<EmailEditorRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // AI Chat
  const [showChat, setShowChat] = useState(false);
  const handleChatBodyUpdate = useCallback((newBody: string) => {
    setBody(newBody);
    editorRef.current?.setContent(newBody);
  }, []);
  const handleChatToUpdate = useCallback((newTo: string) => {
    setTo(newTo);
  }, []);
  const handleChatCcUpdate = useCallback((newCc: string) => {
    setCc(newCc);
  }, []);
  const {
    messages: chatMessages,
    isLoading: chatLoading,
    sendMessage: sendChatMessage,
    clear: clearChat,
  } = useComposeChat({
    onBodyUpdate: handleChatBodyUpdate,
    onToUpdate: handleChatToUpdate,
    onCcUpdate: handleChatCcUpdate,
  });

  // Update fields when mode changes externally
  useEffect(() => {
    setTo(initialTo);
    setCc(initialCc);
    setShowCcField(!!initialCc);
  }, [initialTo, initialCc]);

  // Auto-scroll into view on mount
  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  const parseEmails = (value: string) =>
    value.split(",").map((s) => s.trim()).filter(Boolean);

  const totalAttachmentSize = attachments.reduce((sum, f) => sum + f.size, 0);

  const handleAddFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setAttachments((prev) => {
      const existing = new Set(prev.map((f) => `${f.name}-${f.size}-${f.lastModified}`));
      const deduped = newFiles.filter(
        (f) => !existing.has(`${f.name}-${f.size}-${f.lastModified}`),
      );
      return [...prev, ...deduped];
    });
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = async () => {
    if (totalAttachmentSize > MAX_TOTAL_SIZE) {
      setError("Total attachment size exceeds 25 MB");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const api = createApiClient(getToken);
      const emailData = {
        to: parseEmails(to),
        cc: cc ? parseEmails(cc) : undefined,
        subject,
        body,
        ...(threadId && { thread_id: threadId }),
        ...(inReplyTo && { in_reply_to: inReplyTo }),
        ...(references && { references }),
      };

      const formData = new FormData();
      formData.append("data", JSON.stringify(emailData));
      for (const file of attachments) {
        formData.append("files", file);
      }
      await api.postForm("/emails/send", formData);
      onSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ModeIcon = MODE_ICONS[mode];

  const inputClass =
    "w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <div ref={containerRef} className="mt-4 flex gap-3">
    <div className={cn("rounded-lg border border-border bg-card transition-all duration-300", showChat ? "w-3/4" : "w-full")}>
      {/* Header with mode and actions */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <ModeIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{MODE_LABELS[mode]}</span>
          {/* Mode switcher */}
          {onModeChange && (
            <div className="flex items-center gap-0.5 ml-2">
              {(["reply", "replyAll", "forward"] as const).map((m) => {
                if (m === mode) return null;
                const Icon = MODE_ICONS[m];
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onModeChange(m)}
                    className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                    title={MODE_LABELS[m]}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onDiscard}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Fields */}
      <div className="space-y-2 px-4 pt-3">
        {/* To */}
        <div className="flex items-center gap-2">
          <label className="w-8 text-xs font-medium text-muted-foreground">To</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={inputClass}
            placeholder="recipient@example.com"
            required
          />
          {!showCcField && (
            <button
              type="button"
              onClick={() => setShowCcField(true)}
              className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
            >
              Cc
            </button>
          )}
        </div>

        {/* CC */}
        {showCcField && (
          <div className="flex items-center gap-2">
            <label className="w-8 text-xs font-medium text-muted-foreground">Cc</label>
            <input
              type="text"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              className={inputClass}
              placeholder="cc@example.com"
            />
          </div>
        )}

        {/* Subject (only for forward) */}
        {mode === "forward" && (
          <div className="flex items-center gap-2">
            <label className="w-8 text-xs font-medium text-muted-foreground">Sub</label>
            <input
              type="text"
              value={subject}
              className={cn(inputClass, "text-muted-foreground")}
              readOnly
            />
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="px-4 py-2">
        <EmailEditor
          ref={editorRef}
          initialContent=""
          onUpdate={(html) => setBody(html)}
          placeholder="Write your reply..."
          subject={subject}
        />
      </div>

      {/* AI Actions */}
      <div className="flex flex-wrap items-center gap-2 px-4 pb-2">
        <button
          type="button"
          onClick={() => setShowChat((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent",
            showChat && "bg-accent border-primary/30",
          )}
        >
          <MessageSquare className="h-3.5 w-3.5 text-primary" />
          AI Chat
        </button>
      </div>

      {/* Attachments */}
      <div className="px-4 pb-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            handleAddFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {attachments.length > 0 && (
          <div className="mb-2 space-y-1.5">
            {attachments.map((file, i) => (
              <div
                key={`${file.name}-${file.size}-${file.lastModified}`}
                className="flex items-center gap-2 rounded-md bg-muted/40 px-2.5 py-1.5"
              >
                <FileIcon type={file.type} />
                <span className="min-w-0 flex-1 truncate text-xs">{file.name}</span>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {formatFileSize(file.size)}
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(i)}
                  className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {totalAttachmentSize > MAX_TOTAL_SIZE && (
              <p className="text-xs text-destructive">Total size exceeds 25 MB limit</p>
            )}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-2 border-t border-border px-4 py-2.5">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !to.trim() || totalAttachmentSize > MAX_TOTAL_SIZE}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          {isSubmitting ? "Sending..." : "Send"}
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          title="Attach files"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onDiscard}
          className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          Discard
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 pb-2">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}
    </div>

    {/* AI Chat — side panel */}
    {showChat && (
      <div className="w-1/4 min-w-[220px] max-h-[500px] sticky top-4 rounded-lg border border-border bg-card flex flex-col overflow-hidden">
        <ComposeChat
          messages={chatMessages}
          isLoading={chatLoading}
          onSend={(msg) => sendChatMessage(msg, subject, body, to, cc)}
          onClear={clearChat}
        />
      </div>
    )}
    </div>
  );
}
