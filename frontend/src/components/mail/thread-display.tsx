"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ReplyAll,
  Star,
  Archive,
  MoreHorizontal,
  Trash2,
  Reply,
  Forward,
  Bookmark,
  Calendar,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  File,
  Download,
  Eye,
  Printer,
  Tag,
  MailOpen,
  Mail,
  ShieldAlert,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { createApiClient } from "@/lib/api-client";
import {
  getAvatarColor,
  getInitial,
  formatFullDate,
  formatShortDate,
  formatDateRange,
  formatFileSize,
  getFileTypeStyle,
  formatAddress,
  buildQuotedBody,
  addSubjectPrefix,
} from "@/lib/email-utils";
import { useThread } from "@/hooks/use-threads";
import { AiSummary } from "@/components/ai/ai-summary";
import { AiDraft } from "@/components/ai/ai-draft";
import { LabelPicker } from "@/components/email/label-picker";
import { InlineReply } from "@/components/mail/inline-reply";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ComposeMode, EmailAttachment, Email as FullEmail } from "@/types/email";

interface ThreadDisplayProps {
  emailId: string;
  threadId?: string;
  provider?: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onActionComplete: () => void;
  onToggleStar: (emailId: string, isStarred: boolean) => void;
  removeEmails: (ids: string[], data: Record<string, unknown>) => Promise<void>;
}

interface SingleEmailData {
  id: string;
  thread_id?: string;
  message_id?: string;
  subject: string;
  sender: { name: string; email: string };
  recipients: { name: string; email: string }[];
  cc_recipients?: { name: string; email: string }[];
  body: string;
  body_html?: string;
  snippet: string;
  labels: string[];
  is_read: boolean;
  is_starred: boolean;
  received_at: string;
  provider?: string;
  attachments?: EmailAttachment[];
}

// --- Shared sub-components ---

function EmailBody({ html, text }: { html?: string; text: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const resizeIframe = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument?.body) return;
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
         font-size: 14px; line-height: 1.6; color: #e8e0d4; background: transparent; word-break: break-word; overflow-wrap: break-word; }
  a { color: #60a5fa; }
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
  return <div className="whitespace-pre-wrap text-sm leading-relaxed text-secondary-text">{text}</div>;
}

function AttachmentIcon({ contentType }: { contentType: string }) {
  const cls = "h-4 w-4";
  if (contentType.startsWith("image/")) return <ImageIcon className={cn(cls, "text-green-400")} />;
  if (contentType.startsWith("video/")) return <Film className={cn(cls, "text-pink-400")} />;
  if (contentType.startsWith("audio/")) return <Music className={cn(cls, "text-amber-400")} />;
  if (contentType === "application/pdf") return <File className={cn(cls, "text-red-400")} />;
  if (contentType.includes("document") || contentType.includes("text"))
    return <FileText className={cn(cls, "text-blue-400")} />;
  return <File className={cn(cls, "text-faint")} />;
}

function AttachmentChip({
  attachment,
  onPreview,
  onDownload,
}: {
  attachment: EmailAttachment;
  onPreview?: () => void;
  onDownload?: () => void;
}) {
  const canPreview =
    attachment.content_type.startsWith("image/") ||
    attachment.content_type === "application/pdf" ||
    attachment.content_type.startsWith("text/") ||
    attachment.content_type.startsWith("video/") ||
    attachment.content_type.startsWith("audio/");

  return (
    <button
      type="button"
      onClick={canPreview ? onPreview : onDownload}
      className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm transition-colors hover:bg-accent"
    >
      <AttachmentIcon contentType={attachment.content_type} />
      <span className="max-w-[150px] truncate text-foreground">{attachment.filename}</span>
      <span className="text-xs text-faint">{formatFileSize(attachment.size)}</span>
    </button>
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
          <DialogTitle className="truncate text-sm font-medium">{attachment.filename}</DialogTitle>
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
          {ct.startsWith("text/") && <TextPreview blobUrl={blobUrl} />}
          {ct.startsWith("video/") && <video src={blobUrl} controls className="mx-auto max-h-[75vh] max-w-full" />}
          {ct.startsWith("audio/") && <audio src={blobUrl} controls className="mx-auto w-full max-w-md" />}
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
    <pre className="max-h-[75vh] overflow-auto whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">{text}</pre>
  );
}

// --- Main component ---

export function ThreadDisplay({
  emailId,
  threadId,
  provider,
  onClose,
  onPrev,
  onNext,
  onActionComplete,
  onToggleStar,
  removeEmails,
}: ThreadDisplayProps) {
  const { getToken } = useAuth();
  const { user } = useUser();

  // If threadId is provided, fetch thread data; otherwise fetch single email
  const { thread, isLoading: threadLoading, error: threadError } = useThread(
    threadId,
    provider
  );

  const [singleEmail, setSingleEmail] = useState<SingleEmailData | null>(null);
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleError, setSingleError] = useState<string | null>(null);

  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [attachmentsOpen, setAttachmentsOpen] = useState(true);
  const [showDraft, setShowDraft] = useState(false);
  const [previewAtt, setPreviewAtt] = useState<{ attachment: EmailAttachment; blobUrl: string } | null>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [replyMode, setReplyMode] = useState<ComposeMode | null>(null);
  const threadContentRef = useRef<HTMLDivElement>(null);

  const currentUserEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  // Fetch single email if no threadId
  useEffect(() => {
    if (threadId) return;
    setSingleLoading(true);
    setSingleError(null);
    const api = createApiClient(getToken);
    const qs = provider ? `?provider=${provider}` : "";
    api
      .get<SingleEmailData>(`/emails/${emailId}${qs}`)
      .then((data) => {
        setSingleEmail(data);
        if (data && !data.is_read) {
          api.patch(`/emails/${emailId}${qs}`, { is_read: true }).catch(() => {});
        }
      })
      .catch((err) => {
        setSingleError(err instanceof Error ? err.message : "Failed to load email");
      })
      .finally(() => setSingleLoading(false));
  }, [emailId, threadId, getToken, provider]);

  // Auto-mark thread messages as read
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

  // Expand last message by default
  useEffect(() => {
    if (thread) {
      const last = thread.messages[thread.messages.length - 1];
      if (last) setExpandedMessages(new Set([last.id]));
    } else if (singleEmail) {
      setExpandedMessages(new Set([singleEmail.id]));
    }
  }, [thread, singleEmail]);

  // Cleanup preview blob URLs
  useEffect(() => {
    return () => {
      if (previewAtt?.blobUrl) URL.revokeObjectURL(previewAtt.blobUrl);
    };
  }, [previewAtt]);

  const toggleMessage = (id: string) => {
    setExpandedMessages((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Determine messages array and subject
  const isLoading = threadId ? threadLoading : singleLoading;
  const error = threadId ? threadError?.message : singleError;
  const messages: FullEmail[] = thread
    ? thread.messages
    : singleEmail
      ? [singleEmail as unknown as FullEmail]
      : [];
  const subject = messages[0]?.subject ?? "(No subject)";
  const lastMessage = messages[messages.length - 1];
  const emailIdForAi = lastMessage?.id ?? emailId;

  // Aggregate attachments from all messages
  const allAttachments = messages.flatMap((msg) => msg.attachments ?? []);

  // Unique participants (senders only — for avatars)
  const participants = Array.from(
    new Map(messages.map((m) => [m.sender.email, m.sender])).values()
  );

  // All unique people involved (senders + recipients + cc)
  const allPeopleCount = useMemo(() => {
    const emails = new Set<string>();
    for (const msg of messages) {
      emails.add(msg.sender.email);
      for (const r of msg.recipients ?? []) emails.add(r.email);
      for (const c of msg.cc_recipients ?? []) emails.add(c.email);
    }
    return emails.size;
  }, [messages]);

  // Date range
  const dateRange =
    messages.length > 1
      ? formatDateRange(messages[0].received_at, messages[messages.length - 1].received_at)
      : messages.length === 1
        ? formatFullDate(messages[0].received_at)
        : "";

  const fetchBlob = async (msgId: string, att: EmailAttachment) => {
    const api = createApiClient(getToken);
    const url = api.getAttachmentUrl(msgId, att.id, provider);
    const token = await getToken();
    const resp = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!resp.ok) return null;
    const raw = await resp.blob();
    const blob = new Blob([raw], { type: att.content_type });
    return URL.createObjectURL(blob);
  };

  const handleDownloadAttachment = async (msgId: string, att: EmailAttachment) => {
    const blobUrl = await fetchBlob(msgId, att);
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = att.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  };

  const handlePreviewAttachment = async (msgId: string, att: EmailAttachment) => {
    const blobUrl = await fetchBlob(msgId, att);
    if (blobUrl) setPreviewAtt({ attachment: att, blobUrl });
  };

  const openInlineReply = useCallback((mode: ComposeMode) => {
    setReplyMode(mode);
    // Auto-scroll to bottom after state updates
    setTimeout(() => {
      threadContentRef.current?.scrollTo({
        top: threadContentRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  }, []);

  const computeReplyFields = useMemo(() => {
    if (!replyMode || !lastMessage) return null;
    const email = lastMessage;

    let to = "";
    let cc = "";

    if (replyMode === "reply") {
      to = email.sender.email;
    } else if (replyMode === "replyAll") {
      to = email.sender.email;
      const allRecipients = [
        ...email.recipients.map((r) => r.email),
        ...(email.cc_recipients ?? []).map((r) => r.email),
      ].filter(
        (addr) =>
          addr.toLowerCase() !== email.sender.email.toLowerCase() &&
          addr.toLowerCase() !== currentUserEmail
      );
      cc = allRecipients.join(", ");
    }

    const subj =
      replyMode === "forward"
        ? addSubjectPrefix(email.subject, "Fwd")
        : addSubjectPrefix(email.subject, "Re");

    return {
      to,
      cc,
      subject: subj,
      quotedBody: buildQuotedBody(email),
      threadId: email.thread_id,
      inReplyTo: replyMode !== "forward" ? email.message_id : undefined,
      references: replyMode !== "forward" ? email.message_id : undefined,
    };
  }, [replyMode, lastMessage, currentUserEmail]);

  const handleArchive = async () => {
    try {
      await removeEmails([emailId], { archive: true });
      onActionComplete();
    } catch { /* handled */ }
  };

  const handleDelete = async () => {
    try {
      await removeEmails([emailId], { trash: true });
      onActionComplete();
    } catch { /* handled */ }
  };

  const [localBookmarked, setLocalBookmarked] = useState(false);
  const [localStarred, setLocalStarred] = useState<boolean | null>(null);

  const handleBookmarkToggle = () => {
    setLocalBookmarked((prev) => !prev);
  };

  const handleStarToggle = () => {
    const current = localStarred ?? messages[0]?.is_starred ?? false;
    setLocalStarred(!current);
    onToggleStar(emailId, !current);
  };

  const handleMarkUnread = async () => {
    try {
      const api = createApiClient(getToken);
      const qs = provider ? `?provider=${provider}` : "";
      await api.patch(`/emails/${emailId}${qs}`, { is_read: false });
      onActionComplete();
      onClose();
    } catch {
      /* handled */
    }
  };

  const handleMoveToSpam = async () => {
    try {
      await removeEmails([emailId], { spam: true });
      onActionComplete();
    } catch {
      /* handled */
    }
  };

  const [snoozeMenuOpen, setSnoozeMenuOpen] = useState(false);

  const handleSnooze = async (duration: string) => {
    const now = new Date();
    let snoozeUntil: Date;

    switch (duration) {
      case "1h":
        snoozeUntil = new Date(now.getTime() + 60 * 60 * 1000);
        break;
      case "4h":
        snoozeUntil = new Date(now.getTime() + 4 * 60 * 60 * 1000);
        break;
      case "tomorrow":
        snoozeUntil = new Date(now);
        snoozeUntil.setDate(snoozeUntil.getDate() + 1);
        snoozeUntil.setHours(9, 0, 0, 0);
        break;
      case "next_week":
        snoozeUntil = new Date(now);
        snoozeUntil.setDate(snoozeUntil.getDate() + ((8 - snoozeUntil.getDay()) % 7 || 7));
        snoozeUntil.setHours(9, 0, 0, 0);
        break;
      default:
        return;
    }

    try {
      const api = createApiClient(getToken);
      const qs = provider ? `?provider=${provider}` : "";
      await api.patch(`/emails/${emailId}${qs}`, {
        is_read: true,
        snoozed_until: snoozeUntil.toISOString(),
      });
      await removeEmails([emailId], { snooze: true });
      onActionComplete();
    } catch {
      /* handled — snooze requires backend support */
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-background text-muted-foreground">
        <p className="text-sm">{error ?? "Email not found"}</p>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }

  const isStarred = localStarred ?? messages[0]?.is_starred ?? false;

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-1">
          <button type="button" onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-card">
            <X className="h-4 w-4" />
          </button>
          {onPrev && (
            <button type="button" onClick={onPrev} className="rounded-md p-1.5 text-muted-foreground hover:bg-card">
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {onNext && (
            <button type="button" onClick={onNext} className="rounded-md p-1.5 text-muted-foreground hover:bg-card">
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleBookmarkToggle}
            className="rounded-md p-1.5 text-orange-500 hover:bg-card"
          >
            <Bookmark className={cn("h-4 w-4", localBookmarked && "fill-current")} />
          </button>
          <button
            type="button"
            onClick={() => openInlineReply("replyAll")}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-card"
          >
            <ReplyAll className="h-4 w-4" />
            Reply all
          </button>
          <button
            type="button"
            onClick={handleStarToggle}
            className="rounded-md p-1.5 text-amber-400 hover:bg-card"
          >
            <Star className={cn("h-4 w-4", isStarred && "fill-current")} />
          </button>
          <button type="button" onClick={handleArchive} className="rounded-md p-1.5 text-muted-foreground hover:bg-card">
            <Archive className="h-4 w-4" />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-card"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {moreMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => { setMoreMenuOpen(false); setSnoozeMenuOpen(false); }} />
                <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-border bg-card py-1 shadow-lg">
                  {/* Mark as Unread */}
                  <button
                    type="button"
                    onClick={() => { handleMarkUnread(); setMoreMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent"
                  >
                    <Mail className="h-4 w-4" />
                    Mark as unread
                  </button>

                  {/* Move to Spam */}
                  <button
                    type="button"
                    onClick={() => { handleMoveToSpam(); setMoreMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    Report spam
                  </button>

                  {/* Snooze */}
                  <button
                    type="button"
                    onClick={() => setSnoozeMenuOpen(!snoozeMenuOpen)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent"
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Snooze
                    </span>
                    <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", snoozeMenuOpen && "rotate-180")} />
                  </button>
                  {snoozeMenuOpen && (
                    <div className="border-t border-border py-0.5">
                      <button
                        type="button"
                        onClick={() => { handleSnooze("1h"); setMoreMenuOpen(false); setSnoozeMenuOpen(false); }}
                        className="flex w-full items-center px-3 py-1 pl-9 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        In 1 hour
                      </button>
                      <button
                        type="button"
                        onClick={() => { handleSnooze("4h"); setMoreMenuOpen(false); setSnoozeMenuOpen(false); }}
                        className="flex w-full items-center px-3 py-1 pl-9 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        In 4 hours
                      </button>
                      <button
                        type="button"
                        onClick={() => { handleSnooze("tomorrow"); setMoreMenuOpen(false); setSnoozeMenuOpen(false); }}
                        className="flex w-full items-center px-3 py-1 pl-9 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        Tomorrow morning
                      </button>
                      <button
                        type="button"
                        onClick={() => { handleSnooze("next_week"); setMoreMenuOpen(false); setSnoozeMenuOpen(false); }}
                        className="flex w-full items-center px-3 py-1 pl-9 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        Next week
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-md bg-destructive p-1.5 text-destructive-foreground hover:opacity-90"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Thread Content */}
      <div ref={threadContentRef} className="flex-1 overflow-y-auto px-6 py-4">
        {/* Subject */}
        <h1 className="text-lg font-bold text-foreground">
          {subject}{" "}
          {allPeopleCount > 1 && (
            <span className="text-muted-foreground">[{allPeopleCount}]</span>
          )}
        </h1>
        <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {dateRange}
        </div>

        {/* Participants */}
        {participants.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex -space-x-2">
              {participants.map((p) => (
                <div
                  key={p.email}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border-2 border-background text-xs font-medium text-foreground",
                    getAvatarColor(p.email)
                  )}
                >
                  {getInitial(p.name, p.email)}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {participants.map((p) => (
                <span key={p.email} className="text-sm text-foreground">
                  {p.name || p.email}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Summary */}
        <div className="mt-4">
          <AiSummary emailId={emailIdForAi} provider={provider} />
        </div>

        {/* Attachments Bar */}
        {allAttachments.length > 0 && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setAttachmentsOpen(!attachmentsOpen)}
              className="flex items-center gap-2 text-sm text-foreground"
            >
              Attachments [{allAttachments.length}]
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  attachmentsOpen ? "" : "-rotate-90"
                )}
              />
            </button>
            {attachmentsOpen && (
              <div className="mt-2 flex flex-wrap gap-2">
                {messages.map((msg) =>
                  (msg.attachments ?? []).map((att) => (
                    <AttachmentChip
                      key={`${msg.id}-${att.id}`}
                      attachment={att}
                      onPreview={() => handlePreviewAttachment(msg.id, att)}
                      onDownload={() => handleDownloadAttachment(msg.id, att)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="mt-6 space-y-0">
          {messages.map((msg, idx) => {
            const isExpanded = expandedMessages.has(msg.id);
            const isLast = idx === messages.length - 1;

            return (
              <div key={msg.id}>
                {/* Message Header (always visible) */}
                <button
                  type="button"
                  onClick={() => toggleMessage(msg.id)}
                  className="flex w-full items-center gap-3 py-3 text-left"
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium text-foreground",
                      getAvatarColor(msg.sender.email)
                    )}
                  >
                    {getInitial(msg.sender.name, msg.sender.email)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-bold text-foreground">
                      {msg.sender.name || msg.sender.email}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      To: {msg.recipients?.map((r) => r.name || r.email).join(", ") || "—"}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-xs text-faint">
                    {formatShortDate(msg.received_at)}
                  </span>
                </button>

                {/* Expanded body */}
                <div
                  className={cn(
                    "grid transition-all duration-200",
                    isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="pb-4 pl-12">
                      <EmailBody html={msg.body_html} text={msg.body} />

                      {/* Message attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {msg.attachments.map((att) => (
                            <AttachmentChip
                              key={att.id}
                              attachment={att}
                              onPreview={() => handlePreviewAttachment(msg.id, att)}
                              onDownload={() => handleDownloadAttachment(msg.id, att)}
                            />
                          ))}
                        </div>
                      )}

                      {/* Action Row */}
                      <div className="mt-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openInlineReply("reply")}
                          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-card"
                        >
                          <Reply className="h-4 w-4" />
                          Reply
                          {isLast && <span className="ml-1 text-xs text-faint">R</span>}
                        </button>
                        <button
                          type="button"
                          onClick={() => openInlineReply("forward")}
                          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-card"
                        >
                          <Forward className="h-4 w-4" />
                          Forward
                          {isLast && <span className="ml-1 text-xs text-faint">F</span>}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider between collapsed messages */}
                {!isExpanded && idx < messages.length - 1 && <div className="h-px bg-border" />}
              </div>
            );
          })}
        </div>

        {/* AI Draft */}
        {showDraft && lastMessage && (
          <div className="mt-4">
            <AiDraft emailId={lastMessage.id} provider={provider} />
          </div>
        )}

        {/* Inline Reply */}
        {replyMode && lastMessage && computeReplyFields && (
          <InlineReply
            mode={replyMode}
            to={computeReplyFields.to}
            cc={computeReplyFields.cc}
            subject={computeReplyFields.subject}
            quotedBody={computeReplyFields.quotedBody}
            threadId={computeReplyFields.threadId}
            inReplyTo={computeReplyFields.inReplyTo}
            references={computeReplyFields.references}
            emailId={emailId}
            provider={provider}
            onSent={() => {
              setReplyMode(null);
              onActionComplete();
            }}
            onDiscard={() => setReplyMode(null)}
            onModeChange={(newMode) => setReplyMode(newMode)}
          />
        )}
      </div>

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
  );
}
