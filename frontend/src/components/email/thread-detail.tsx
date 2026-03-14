"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Paperclip, Download, FileText, Image as ImageIcon, Film, Music, Archive, File, Eye, X, Trash2, Tag } from "lucide-react";
import { LabelPicker } from "@/components/email/label-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { createApiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { AiSummary } from "@/components/ai/ai-summary";
import { AiDraft } from "@/components/ai/ai-draft";
import { useThread } from "@/hooks/use-threads";
import type { Email, EmailAttachment } from "@/types/email";

interface ThreadDetailProps {
  threadId: string;
  provider?: string;
  embedded?: boolean;
  onClose?: () => void;
  onActionComplete?: () => void;
}

interface EmailAddress {
  name: string;
  email: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatShortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatAddress(addr: EmailAddress) {
  return addr.name ? `${addr.name} <${addr.email}>` : addr.email;
}

function EmailBody({ html, text }: { html?: string; text: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const resizeIframe = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument?.body) return;
    // Reset to 0 first to measure true content height and prevent feedback loop
    iframe.style.height = "0";
    iframe.style.height = iframe.contentDocument.body.scrollHeight + "px";
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !html) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<base target="_blank">
<style>
  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
         font-size: 14px; line-height: 1.6; color: #1a1a1a; word-break: break-word; overflow-wrap: break-word; }
  a { color: #2563eb; }
  img { max-width: 100%; height: auto; }
  table { max-width: 100% !important; }
  pre, code { white-space: pre-wrap; max-width: 100%; overflow-x: auto; }
</style></head><body>${sanitizeHtml(html)}</body></html>`);
    doc.close();

    resizeIframe();
    const observer = new ResizeObserver(resizeIframe);
    if (doc.body) observer.observe(doc.body);
    return () => observer.disconnect();
  }, [html, resizeIframe]);

  if (html) {
    return (
      <iframe
        ref={iframeRef}
        sandbox="allow-same-origin allow-popups"
        className="w-full border-0"
        style={{ minHeight: 100 }}
        title="Email content"
      />
    );
  }

  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed">{text}</div>
  );
}

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
  if (contentType.includes("zip") || contentType.includes("compressed") || contentType.includes("archive")) return { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-600 dark:text-yellow-400", label: "ZIP" };
  return { bg: "bg-gray-100 dark:bg-gray-900/30", text: "text-gray-600 dark:text-gray-400", label: "FILE" };
}

function AttachmentIcon({ contentType }: { contentType: string }) {
  const cls = "h-5 w-5 shrink-0";
  if (contentType.startsWith("image/")) return <ImageIcon className={cls} />;
  if (contentType.startsWith("video/")) return <Film className={cls} />;
  if (contentType.startsWith("audio/")) return <Music className={cls} />;
  if (contentType === "application/pdf" || contentType.includes("document") || contentType.includes("text"))
    return <FileText className={cls} />;
  if (contentType.includes("zip") || contentType.includes("compressed") || contentType.includes("archive"))
    return <Archive className={cls} />;
  return <File className={cls} />;
}

function AttachmentPreview({ attachment }: { attachment: EmailAttachment }) {
  const style = getFileTypeStyle(attachment.content_type);
  return (
    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", style.bg, style.text)}>
      <AttachmentIcon contentType={attachment.content_type} />
    </div>
  );
}

function isPreviewable(contentType: string): boolean {
  return (
    contentType.startsWith("image/") ||
    contentType === "application/pdf" ||
    contentType.startsWith("text/") ||
    contentType.startsWith("video/") ||
    contentType.startsWith("audio/")
  );
}

function AttachmentPreviewModal({
  attachment,
  blobUrl,
  onClose,
  onDownload,
}: {
  attachment: EmailAttachment;
  blobUrl: string;
  onClose: () => void;
  onDownload: () => void;
}) {
  const ct = attachment.content_type;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0" showClose={false}>
        <DialogHeader className="flex flex-row items-center justify-between gap-2 border-b px-4 py-3">
          <DialogTitle className="truncate text-sm font-medium">
            {attachment.filename}
          </DialogTitle>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onDownload} className="gap-1.5">
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="overflow-auto p-4" style={{ maxHeight: "calc(90vh - 60px)" }}>
          {ct.startsWith("image/") && (
            <img src={blobUrl} alt={attachment.filename} className="mx-auto max-h-[75vh] max-w-full object-contain" />
          )}
          {ct === "application/pdf" && (
            <object data={blobUrl} type="application/pdf" className="h-[75vh] w-full">
              <p className="p-4 text-center text-sm text-muted-foreground">
                Unable to display PDF.{" "}
                <button onClick={onDownload} className="underline">Download</button> instead.
              </p>
            </object>
          )}
          {ct.startsWith("text/") && (
            <TextPreview blobUrl={blobUrl} />
          )}
          {ct.startsWith("video/") && (
            <video src={blobUrl} controls className="mx-auto max-h-[75vh] max-w-full" />
          )}
          {ct.startsWith("audio/") && (
            <audio src={blobUrl} controls className="mx-auto w-full max-w-md" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TextPreview({ blobUrl }: { blobUrl: string }) {
  const [text, setText] = useState("Loading...");
  useEffect(() => {
    fetch(blobUrl)
      .then((r) => r.text())
      .then(setText)
      .catch(() => setText("Failed to load preview"));
  }, [blobUrl]);
  return (
    <pre className="max-h-[75vh] overflow-auto whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
      {text}
    </pre>
  );
}

function MessageCard({
  message,
  defaultExpanded,
  provider,
}: {
  message: Email;
  defaultExpanded: boolean;
  provider?: string;
}) {
  const { getToken } = useAuth();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [previewAtt, setPreviewAtt] = useState<{ attachment: EmailAttachment; blobUrl: string } | null>(null);
  const sender = message.sender;
  const attachments = message.attachments;

  useEffect(() => {
    return () => {
      if (previewAtt?.blobUrl) {
        URL.revokeObjectURL(previewAtt.blobUrl);
      }
    };
  }, [previewAtt]);

  const fetchBlob = async (att: EmailAttachment) => {
    const api = createApiClient(getToken);
    const url = api.getAttachmentUrl(message.id, att.id, provider);
    const token = await getToken();
    const resp = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!resp.ok) return null;
    const raw = await resp.blob();
    const blob = new Blob([raw], { type: att.content_type });
    return URL.createObjectURL(blob);
  };

  const handleDownload = async (att: EmailAttachment) => {
    const blobUrl = await fetchBlob(att);
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = att.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  };

  const handlePreview = async (att: EmailAttachment) => {
    const blobUrl = await fetchBlob(att);
    if (blobUrl) setPreviewAtt({ attachment: att, blobUrl });
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/30",
          expanded && "border-b border-border",
        )}
      >
        <div className="mt-0.5 shrink-0 text-muted-foreground">
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium">
              {sender.name || sender.email}
            </span>
            <div className="flex shrink-0 items-center gap-1.5">
              {attachments && attachments.length > 0 && (
                <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className="text-xs text-muted-foreground">
                {formatShortDate(message.received_at)}
              </span>
            </div>
          </div>
          {!expanded && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {message.snippet}
            </p>
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 py-3">
          <div className="mb-3 flex flex-col gap-1 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">From: </span>
              {formatAddress(sender)}
            </div>
            {message.recipients && message.recipients.length > 0 && (
              <div>
                <span className="font-medium">To: </span>
                {message.recipients.map(formatAddress).join(", ")}
              </div>
            )}
            {attachments && attachments.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="inline h-3 w-3" />
                <span>
                  {attachments.length === 1
                    ? "Attachment"
                    : `Attachments (${attachments.length})`}
                </span>
              </div>
            )}
          </div>
          <EmailBody html={message.body_html} text={message.body} />

          {attachments && attachments.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Paperclip className="h-4 w-4" />
                {attachments.length === 1
                  ? "Attachment"
                  : `Attachments (${attachments.length})`}
              </div>
              <div className="flex flex-wrap gap-2">
                {attachments.map((att) => {
                  const canPreview = isPreviewable(att.content_type);
                  return (
                    <div
                      key={att.id}
                      className="flex w-56 items-center gap-3 rounded-lg bg-muted/40 p-3 transition-colors hover:bg-muted/70"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          canPreview ? handlePreview(att) : handleDownload(att);
                        }}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <AttachmentPreview attachment={att} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{att.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {getFileTypeStyle(att.content_type).label} · {formatFileSize(att.size)}
                          </p>
                        </div>
                      </button>
                      <div className="flex shrink-0 items-center gap-0.5">
                        {canPreview && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview(att);
                            }}
                            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            title="Preview"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(att);
                          }}
                          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          title="Download"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Attachment preview modal */}
          {previewAtt && (
            <AttachmentPreviewModal
              attachment={previewAtt.attachment}
              blobUrl={previewAtt.blobUrl}
              onClose={() => {
                URL.revokeObjectURL(previewAtt.blobUrl);
                setPreviewAtt(null);
              }}
              onDownload={() => {
                const a = document.createElement("a");
                a.href = previewAtt.blobUrl;
                a.download = previewAtt.attachment.filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

export function ThreadDetail({ threadId, provider, embedded, onClose, onActionComplete }: ThreadDetailProps) {
  const { getToken } = useAuth();
  const router = useRouter();
  const { thread, isLoading, error } = useThread(threadId, provider);
  const [showDraft, setShowDraft] = useState(false);
  const [threadLabels, setThreadLabels] = useState<string[]>([]);

  useEffect(() => {
    if (thread) {
      const last = thread.messages[thread.messages.length - 1];
      if (last) setThreadLabels(last.labels ?? []);
    }
  }, [thread]);

  useEffect(() => {
    if (!thread) return;
    const api = createApiClient(getToken);
    const qs = provider ? `?provider=${provider}` : "";
    thread.messages
      .filter((msg) => !msg.is_read)
      .forEach((msg) => {
        api.patch(`/emails/${msg.id}${qs}`, { is_read: true }).catch(() => {});
      });
  }, [thread, getToken, provider]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          {error?.message ?? "Thread not found"}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={embedded ? onClose : () => router.push("/inbox")}
        >
          {embedded ? "Close" : "Back to Inbox"}
        </Button>
      </div>
    );
  }

  const messages = thread.messages;
  const subject = messages[0]?.subject ?? "(No subject)";
  const lastMessage = messages[messages.length - 1];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold md:text-xl">{subject}</h1>
          {messages.length > 1 && (
            <p className="mt-1 text-sm text-muted-foreground">
              {messages.length - 1}{" "}
              {messages.length - 1 === 1 ? "reply" : "replies"}
            </p>
          )}
        </div>
        {embedded ? (
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/inbox")}
          >
            Back
          </Button>
        )}
      </div>

      {/* Labels */}
      {lastMessage && (
        <LabelPicker
          emailId={lastMessage.id}
          provider={provider}
          currentLabels={threadLabels}
          onLabelsChange={setThreadLabels}
        />
      )}

      {/* AI Summary — at top for quick access */}
      {lastMessage && (
        <AiSummary emailId={lastMessage.id} provider={provider} />
      )}

      {/* Messages */}
      <div className="flex flex-col gap-3">
        {messages.map((msg, i) => (
          <MessageCard
            key={msg.id}
            message={msg}
            defaultExpanded={i === messages.length - 1}
            provider={provider}
          />
        ))}
      </div>

      {/* AI Draft */}
      {lastMessage && (
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDraft(!showDraft)}
          >
            {showDraft ? "Hide Draft" : "AI Draft Reply"}
          </Button>
          {showDraft && (
            <AiDraft emailId={lastMessage.id} provider={provider} />
          )}
        </div>
      )}
    </div>
  );
}
