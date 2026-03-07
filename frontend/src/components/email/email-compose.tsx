"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { createApiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Paperclip, X, FileText, Image, Film, Music, Archive, File, Save, Sparkles } from "lucide-react";
import type { ComposeData, ComposeMode, Draft } from "@/types/email";
import { useComposeAssist } from "@/hooks/use-compose-assist";

export const COMPOSE_STORAGE_KEY = "bertram_compose";

export function storeComposeData(data: ComposeData) {
  sessionStorage.setItem(COMPOSE_STORAGE_KEY, JSON.stringify(data));
}

type Status =
  | { kind: "idle" }
  | { kind: "success" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

const MODE_LABELS: Record<ComposeMode, string> = {
  new: "New Message",
  reply: "Reply",
  replyAll: "Reply All",
  forward: "Forward",
};

const MAX_TOTAL_SIZE = 25 * 1024 * 1024; // 25 MB
const AUTO_SAVE_DELAY = 3000; // 3 seconds

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileTypeStyle(contentType: string): { bg: string; text: string; label: string } {
  if (contentType.startsWith("image/")) return { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400", label: contentType.replace("image/", "").toUpperCase() };
  if (contentType.startsWith("video/")) return { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-600 dark:text-pink-400", label: contentType.replace("video/", "").toUpperCase() };
  if (contentType.startsWith("audio/")) return { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400", label: contentType.replace("audio/", "").toUpperCase() };
  if (contentType === "application/pdf") return { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400", label: "PDF" };
  if (contentType.includes("spreadsheet") || contentType.includes("excel") || contentType.includes("csv")) return { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400", label: "XLS" };
  if (contentType.includes("presentation") || contentType.includes("powerpoint")) return { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400", label: "PPT" };
  if (contentType.includes("document") || contentType.includes("msword")) return { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", label: "DOC" };
  if (contentType.includes("text")) return { bg: "bg-slate-100 dark:bg-slate-900/30", text: "text-slate-600 dark:text-slate-400", label: "TXT" };
  if (contentType.includes("zip") || contentType.includes("compressed")) return { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-600 dark:text-yellow-400", label: "ZIP" };
  return { bg: "bg-gray-100 dark:bg-gray-900/30", text: "text-gray-600 dark:text-gray-400", label: "FILE" };
}

function FileIcon({ type }: { type: string }) {
  const cls = "h-4 w-4 shrink-0";
  if (type.startsWith("image/")) return <Image className={cls} />;
  if (type.startsWith("video/")) return <Film className={cls} />;
  if (type.startsWith("audio/")) return <Music className={cls} />;
  if (type === "application/pdf" || type.includes("document") || type.includes("text"))
    return <FileText className={cls} />;
  if (type.includes("zip") || type.includes("compressed"))
    return <Archive className={cls} />;
  return <File className={cls} />;
}

function FilePreview({ file }: { file: File }) {
  const style = getFileTypeStyle(file.type);
  return (
    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md", style.bg, style.text)}>
      <FileIcon type={file.type} />
    </div>
  );
}

interface EmailComposeProps {
  embedded?: boolean;
  initialData?: ComposeData;
  onClose?: () => void;
  onSent?: () => void;
}

export function EmailCompose({ embedded, initialData, onClose, onSent }: EmailComposeProps = {}) {
  const { getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftParam = embedded ? null : searchParams.get("draft");

  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [mode, setMode] = useState<ComposeMode>("new");
  const [threadId, setThreadId] = useState<string | undefined>();
  const [inReplyTo, setInReplyTo] = useState<string | undefined>();
  const [references, setReferences] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [draftId, setDraftId] = useState<string | undefined>(undefined);
  const draftIdRef = useRef<string | undefined>(undefined);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);
  const hasContentRef = useRef(false);

  const [showAiAssist, setShowAiAssist] = useState(false);
  const [aiInstructions, setAiInstructions] = useState("");
  const { draftBody: aiDraftBody, isLoading: aiLoading, error: aiError, execute: runAiAssist } = useComposeAssist();

  // Track whether the form has meaningful content worth auto-saving
  useEffect(() => {
    hasContentRef.current = !!(to || cc || subject || body);
  }, [to, cc, subject, body]);

  // Apply AI-generated body
  useEffect(() => {
    if (aiDraftBody) {
      setBody(aiDraftBody);
      setShowAiAssist(false);
      setAiInstructions("");
    }
  }, [aiDraftBody]);

  // Load draft from API or sessionStorage on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (embedded && initialData) {
      setTo(initialData.to || "");
      setCc(initialData.cc || "");
      setSubject(initialData.subject || "");
      setBody(initialData.body || "");
      setMode(initialData.mode || "new");
      setThreadId(initialData.thread_id);
      setInReplyTo(initialData.in_reply_to);
      setReferences(initialData.references);
      return;
    }

    if (draftParam) {
      // Load existing draft from API
      const loadDraft = async () => {
        try {
          const api = createApiClient(getToken);
          const draft = await api.get<Draft>(`/drafts/${draftParam}`);
          setTo(draft.to.join(", "));
          setCc(draft.cc.join(", "));
          setSubject(draft.subject);
          setBody(draft.body);
          setMode((draft.mode as ComposeMode) || "new");
          setThreadId(draft.thread_id ?? undefined);
          setInReplyTo(draft.in_reply_to ?? undefined);
          setReferences(draft.references ?? undefined);
          draftIdRef.current = draft.id;
          setDraftId(draft.id);
        } catch {
          setStatus({ kind: "error", message: "Failed to load draft" });
        }
      };
      loadDraft();
      return;
    }

    // Fall back to sessionStorage for reply/forward context
    try {
      const stored = sessionStorage.getItem(COMPOSE_STORAGE_KEY);
      if (!stored) return;
      sessionStorage.removeItem(COMPOSE_STORAGE_KEY);
      const data: ComposeData = JSON.parse(stored);
      setTo(data.to || "");
      setCc(data.cc || "");
      setSubject(data.subject || "");
      setBody(data.body || "");
      setMode(data.mode || "new");
      setThreadId(data.thread_id);
      setInReplyTo(data.in_reply_to);
      setReferences(data.references);
    } catch {
      // ignore malformed data
    }
  }, [draftParam, getToken, embedded, initialData]);

  const parseEmails = (value: string) =>
    value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  // Save draft to API
  const saveDraft = useCallback(async () => {
    if (!hasContentRef.current) return;
    setIsSavingDraft(true);
    try {
      const api = createApiClient(getToken);
      const draftData = {
        to: parseEmails(to),
        cc: cc ? parseEmails(cc) : [],
        subject,
        body,
        mode,
        thread_id: threadId ?? null,
        in_reply_to: inReplyTo ?? null,
        references: references ?? null,
      };

      if (draftIdRef.current) {
        await api.put(`/drafts/${draftIdRef.current}`, draftData);
      } else {
        const created = await api.post<Draft>("/drafts", draftData);
        draftIdRef.current = created.id;
        setDraftId(created.id);
        // Update URL without reload so future saves update instead of creating new
        if (!embedded) {
          window.history.replaceState(null, "", `/compose?draft=${created.id}`);
        }
      }
      setStatus({ kind: "saved" });
    } finally {
      setIsSavingDraft(false);
    }
  }, [getToken, to, cc, subject, body, mode, threadId, inReplyTo, references, embedded]);

  // Auto-save on content change (debounced)
  useEffect(() => {
    // Don't auto-save until the form has been initialized
    if (!initializedRef.current) return;
    if (!hasContentRef.current) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      saveDraft().catch(() => {
        // Silent fail for auto-save
      });
    }, AUTO_SAVE_DELAY);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [to, cc, subject, body, saveDraft]);

  const handleManualSave = async () => {
    setStatus({ kind: "saving" });
    try {
      await saveDraft();
      setStatus({ kind: "saved" });
    } catch {
      setStatus({ kind: "error", message: "Failed to save draft" });
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalAttachmentSize > MAX_TOTAL_SIZE) {
      setStatus({ kind: "error", message: "Total attachment size exceeds 25 MB" });
      return;
    }
    setIsSubmitting(true);
    setStatus({ kind: "idle" });

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

      // Delete the draft after successful send
      if (draftIdRef.current) {
        try {
          await api.delete(`/drafts/${draftIdRef.current}`);
        } catch {
          // non-critical
        }
      }

      // Cancel pending auto-save
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      setTo("");
      setCc("");
      setSubject("");
      setBody("");
      setMode("new");
      setThreadId(undefined);
      setInReplyTo(undefined);
      setReferences(undefined);
      setAttachments([]);
      draftIdRef.current = undefined;
      setDraftId(undefined);
      if (embedded && onSent) {
        onSent();
      } else {
        setStatus({ kind: "success" });
      }
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Failed to send email",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    if (embedded && onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const inputClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {embedded && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{mode === "new" ? "New email" : MODE_LABELS[mode]}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      {mode !== "new" && (
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {MODE_LABELS[mode]}
          </span>
        </div>
      )}
      <div>
        <label htmlFor="to" className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          To
        </label>
        <input
          id="to"
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className={inputClass}
          placeholder="recipient@example.com, another@example.com"
          required
        />
      </div>
      <div>
        <label htmlFor="cc" className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          CC
        </label>
        <input
          id="cc"
          type="text"
          value={cc}
          onChange={(e) => setCc(e.target.value)}
          className={inputClass}
          placeholder="cc@example.com"
        />
      </div>
      <div>
        <label htmlFor="subject" className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Subject
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={inputClass}
          placeholder="Subject"
        />
      </div>
      <div>
        <label htmlFor="body" className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Body
        </label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={cn(inputClass, "min-h-[200px] resize-y")}
          placeholder="Write your message..."
        />
      </div>
      {/* AI Assist */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setShowAiAssist((v) => !v)}
          disabled={isSubmitting || aiLoading}
          className="inline-flex w-fit items-center gap-2 rounded-md border border-input px-3 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4 text-paprika" />
          AI Assist
        </button>
        {showAiAssist && (
          <div className="flex flex-col gap-2 rounded-md border border-input bg-accent/30 p-3">
            <input
              type="text"
              value={aiInstructions}
              onChange={(e) => setAiInstructions(e.target.value)}
              className={inputClass}
              placeholder="e.g., make it more formal, add a call to action..."
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={aiLoading}
                onClick={() =>
                  runAiAssist({
                    subject,
                    body,
                    instructions: aiInstructions,
                    attachments,
                  })
                }
                className="inline-flex items-center gap-2 rounded-md bg-paprika px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-paprika/90 disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  "Generate"
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAiAssist(false);
                  setAiInstructions("");
                }}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
              >
                Cancel
              </button>
            </div>
            {aiError && (
              <p className="text-sm text-destructive">{aiError.message}</p>
            )}
          </div>
        )}
      </div>

      {/* Attachments */}
      <div>
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
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          <Paperclip className="h-4 w-4" />
          Attach files
        </button>

        {attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {attachments.map((file, i) => (
              <div
                key={`${file.name}-${file.size}-${file.lastModified}`}
                className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2"
              >
                <FilePreview file={file} />
                <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {getFileTypeStyle(file.type).label} · {formatFileSize(file.size)}
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(i)}
                  className="shrink-0 rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Total: {formatFileSize(totalAttachmentSize)}
              {totalAttachmentSize > MAX_TOTAL_SIZE && (
                <span className="ml-1 text-destructive">(exceeds 25 MB limit)</span>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={isSubmitting || totalAttachmentSize > MAX_TOTAL_SIZE}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? "Sending..." : "Send"}
        </button>
        <button
          type="button"
          onClick={handleManualSave}
          disabled={isSavingDraft || isSubmitting}
          className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSavingDraft ? "Saving..." : "Save Draft"}
        </button>
        {mode !== "new" && (
          <button
            type="button"
            onClick={handleDiscard}
            className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Discard
          </button>
        )}
        {status.kind === "saved" && (
          <span className="text-xs text-muted-foreground">Draft saved</span>
        )}
      </div>

      {status.kind === "success" && (
        <p className="text-sm text-green-600">Email sent successfully.</p>
      )}
      {status.kind === "error" && (
        <p className="text-sm text-destructive">{status.message}</p>
      )}
    </form>
  );
}
