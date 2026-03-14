"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createApiClient } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AiSummary } from "@/components/ai/ai-summary";
import { AiDraft } from "@/components/ai/ai-draft";
import { AiChat } from "@/components/ai/ai-chat";
import { storeComposeData } from "./email-compose";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import type { ComposeMode, EmailAttachment } from "@/types/email";
import { Reply, ReplyAll, Forward, Paperclip, Download, FileText, Image as ImageIcon, Film, Music, Archive as ArchiveIcon, Trash2, File, Eye, X, Star, Tag, Printer } from "lucide-react";
import { LabelPicker } from "@/components/email/label-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EmailDetailProps {
  emailId: string | string[] | undefined;
  provider?: string;
  embedded?: boolean;
  onClose?: () => void;
  onActionComplete?: () => void;
}

interface EmailAddress {
  name: string;
  email: string;
}

interface EmailData {
  id: string;
  thread_id?: string;
  message_id?: string;
  subject: string;
  sender: EmailAddress;
  recipients: EmailAddress[];
  cc_recipients?: EmailAddress[];
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

function formatAddress(addr: EmailAddress) {
  return addr.name ? `${addr.name} <${addr.email}>` : addr.email;
}

function buildQuotedBody(email: EmailData): string {
  const header =
    `\n\n---------- Original Message ----------\n` +
    `From: ${formatAddress(email.sender)}\n` +
    `Date: ${formatDate(email.received_at)}\n` +
    `Subject: ${email.subject}\n` +
    `To: ${email.recipients.map(formatAddress).join(", ")}\n` +
    (email.cc_recipients?.length
      ? `CC: ${email.cc_recipients.map(formatAddress).join(", ")}\n`
      : "");

  const quotedLines = email.body
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");

  return `${header}\n${quotedLines}`;
}

function addSubjectPrefix(subject: string, prefix: "Re" | "Fwd"): string {
  const stripped = subject.replace(/^(Re|Fwd|Fw):\s*/i, "");
  return `${prefix}: ${stripped}`;
}

const SYSTEM_LABELS = new Set([
  "INBOX", "SENT", "DRAFT", "TRASH", "SPAM", "UNREAD", "STARRED",
  "IMPORTANT", "CATEGORY_PERSONAL", "CATEGORY_SOCIAL", "CATEGORY_PROMOTIONS",
  "CATEGORY_UPDATES", "CATEGORY_FORUMS",
]);

function readableLabel(label: string) {
  if (label.startsWith("CATEGORY_")) return label.replace("CATEGORY_", "").toLowerCase();
  return label.toLowerCase();
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
        style={{ minHeight: 120 }}
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
    return <ArchiveIcon className={cls} />;
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

export function EmailDetail({ emailId, provider, embedded, onClose, onActionComplete }: EmailDetailProps) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState<EmailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDraft, setShowDraft] = useState(false);
  const [previewAtt, setPreviewAtt] = useState<{ attachment: EmailAttachment; blobUrl: string } | null>(null);
  const [isActioning, setIsActioning] = useState(false);
  const id = Array.isArray(emailId) ? emailId[0] : emailId;

  const currentUserEmail =
    user?.primaryEmailAddress?.emailAddress?.toLowerCase() ?? "";

  useEffect(() => {
    return () => {
      if (previewAtt?.blobUrl) {
        URL.revokeObjectURL(previewAtt.blobUrl);
      }
    };
  }, [previewAtt]);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    const api = createApiClient(getToken);
    const qs = provider ? `?provider=${provider}` : "";
    api
      .get<EmailData>(`/emails/${id}${qs}`)
      .then((data) => {
        setEmail(data);
        if (data && !data.is_read) {
          api.patch(`/emails/${id}${qs}`, { is_read: true }).catch(() => {});
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load email");
        setEmail(null);
      })
      .finally(() => setIsLoading(false));
  }, [id, getToken, provider]);

  const handleAction = async (data: Record<string, unknown>) => {
    if (!id) return;
    setIsActioning(true);
    try {
      const api = createApiClient(getToken);
      const qs = provider ? `?provider=${provider}` : "";
      await api.patch(`/emails/${id}${qs}`, data);
      if (embedded && onActionComplete) {
        onActionComplete();
      } else {
        router.push("/inbox");
      }
    } catch {
      setIsActioning(false);
    }
  };

  const navigateToCompose = (mode: ComposeMode) => {
    if (!email) return;

    const quoted = buildQuotedBody(email);

    let to = "";
    let cc = "";

    if (mode === "reply") {
      to = email.sender.email;
    } else if (mode === "replyAll") {
      to = email.sender.email;
      const allRecipients = [
        ...email.recipients.map((r) => r.email),
        ...(email.cc_recipients ?? []).map((r) => r.email),
      ].filter(
        (addr) =>
          addr.toLowerCase() !== email.sender.email.toLowerCase() &&
          addr.toLowerCase() !== currentUserEmail,
      );
      cc = allRecipients.join(", ");
    }

    const subject =
      mode === "forward"
        ? addSubjectPrefix(email.subject, "Fwd")
        : addSubjectPrefix(email.subject, "Re");

    storeComposeData({
      mode,
      to,
      cc,
      subject,
      body: mode === "forward" ? quoted : `\n${quoted}`,
      thread_id: email.thread_id,
      in_reply_to: mode !== "forward" ? email.message_id : undefined,
      references: mode !== "forward" ? email.message_id : undefined,
    });

    router.push("/compose");
  };

  const printMail = () => {
    if (!email) return;
    try {
      const printFrame = document.createElement("iframe");
      printFrame.style.position = "absolute";
      printFrame.style.top = "-9999px";
      printFrame.style.left = "-9999px";
      printFrame.style.width = "0px";
      printFrame.style.height = "0px";
      printFrame.style.border = "none";
      document.body.appendChild(printFrame);

      const escapeHtml = (str: string) =>
        str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      const userLabels = email.labels
        .filter((l) => !SYSTEM_LABELS.has(l))
        .map((l) => readableLabel(l));

      const printContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Print Email - ${escapeHtml(email.subject || "No Subject")}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; line-height: 1.5; color: #333; background: white; padding: 20px; font-size: 12px; }
    .email-container { max-width: 100%; margin: 0 auto; }
    .email-title { font-size: 18px; font-weight: bold; color: #000; margin-bottom: 15px; word-wrap: break-word; }
    .email-meta { margin-bottom: 20px; }
    .meta-row { margin-bottom: 5px; display: flex; align-items: flex-start; }
    .meta-label { font-weight: bold; min-width: 60px; color: #333; margin-right: 10px; }
    .meta-value { flex: 1; word-wrap: break-word; color: #333; }
    .separator { width: 100%; height: 1px; background: #ddd; margin: 20px 0; }
    .email-content { word-wrap: break-word; overflow-wrap: break-word; font-size: 12px; line-height: 1.6; }
    .email-content img { max-width: 100% !important; height: auto !important; display: block; margin: 10px 0; }
    .email-content table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    .email-content td, .email-content th { padding: 6px; text-align: left; font-size: 11px; }
    .email-content a { color: #0066cc; text-decoration: underline; }
    .attachments-title { font-size: 14px; font-weight: bold; color: #000; margin-bottom: 10px; margin-top: 25px; }
    .attachment-item { margin-bottom: 5px; font-size: 11px; padding: 3px 0; }
    .attachment-name { font-weight: 500; color: #333; }
    .attachment-size { color: #666; font-size: 10px; }
    .label-badge { display: inline-block; padding: 2px 6px; background: #f5f5f5; color: #333; font-size: 10px; margin-right: 5px; margin-bottom: 3px; }
    @media print {
      body { margin: 0; padding: 15px; font-size: 11px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .separator { background: #000 !important; }
      .email-content a { color: #000 !important; }
      .label-badge { background: #f0f0f0 !important; border: 1px solid #ccc; }
      * { border: none !important; box-shadow: none !important; }
      .email-header { page-break-after: avoid; }
      .attachments-section { page-break-inside: avoid; }
    }
    @page { margin: 0.5in; size: A4; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1 class="email-title">${escapeHtml(email.subject || "No Subject")}</h1>
      ${userLabels.length > 0 ? `<div style="margin-bottom:10px">${userLabels.map((l) => `<span class="label-badge">${escapeHtml(l)}</span>`).join("")}</div>` : ""}
      <div class="email-meta">
        <div class="meta-row">
          <span class="meta-label">From:</span>
          <span class="meta-value">${escapeHtml(email.sender.name || "")} &lt;${escapeHtml(email.sender.email)}&gt;</span>
        </div>
        ${email.recipients.length > 0 ? `<div class="meta-row"><span class="meta-label">To:</span><span class="meta-value">${email.recipients.map((r) => `${escapeHtml(r.name || "")} &lt;${escapeHtml(r.email)}&gt;`).join(", ")}</span></div>` : ""}
        ${email.cc_recipients && email.cc_recipients.length > 0 ? `<div class="meta-row"><span class="meta-label">CC:</span><span class="meta-value">${email.cc_recipients.map((r) => `${escapeHtml(r.name || "")} &lt;${escapeHtml(r.email)}&gt;`).join(", ")}</span></div>` : ""}
        <div class="meta-row">
          <span class="meta-label">Date:</span>
          <span class="meta-value">${formatDate(email.received_at)}</span>
        </div>
      </div>
    </div>
    <div class="separator"></div>
    <div class="email-body">
      <div class="email-content">${email.body_html ? sanitizeHtml(email.body_html) : escapeHtml(email.body).replace(/\n/g, "<br>")}</div>
    </div>
    ${email.attachments && email.attachments.length > 0 ? `
    <div class="attachments-section">
      <h2 class="attachments-title">Attachments (${email.attachments.length})</h2>
      ${email.attachments.map((att) => `<div class="attachment-item"><span class="attachment-name">${escapeHtml(att.filename)}</span>${att.size ? ` - <span class="attachment-size">${formatFileSize(att.size)}</span>` : ""}</div>`).join("")}
    </div>` : ""}
  </div>
</body>
</html>`;

      const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
      if (!frameDoc) {
        document.body.removeChild(printFrame);
        return;
      }

      frameDoc.open();
      frameDoc.write(printContent);
      frameDoc.close();

      let printed = false;
      printFrame.onload = () => {
        if (!printed) {
          printed = true;
          printFrame.contentWindow?.print();
        }
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      };

      // Fallback for browsers that don't fire onload for about:blank iframes
      setTimeout(() => {
        try {
          if (!printed) {
            printed = true;
            printFrame.contentWindow?.print();
          }
        } catch { /* already printed */ }
        setTimeout(() => {
          if (printFrame.parentNode) {
            document.body.removeChild(printFrame);
          }
        }, 1000);
      }, 500);
    } catch {
      window.print();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">{error ?? "Email not found"}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={embedded ? onClose : () => router.push("/inbox")}>
          {embedded ? "Close" : "Back to Inbox"}
        </Button>
      </div>
    );
  }

  const handleLabelsChange = (newLabels: string[]) => {
    setEmail((prev) => prev ? { ...prev, labels: [
      ...prev.labels.filter((l) => SYSTEM_LABELS.has(l)),
      ...newLabels.filter((l) => !SYSTEM_LABELS.has(l)),
    ] } : prev);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                const newStarred = !email.is_starred;
                setEmail((prev) => prev ? { ...prev, is_starred: newStarred } : prev);
                try {
                  const api = createApiClient(getToken);
                  const qs = provider ? `?provider=${provider}` : "";
                  await api.patch(`/emails/${id}${qs}`, { is_starred: newStarred });
                } catch {
                  setEmail((prev) => prev ? { ...prev, is_starred: !newStarred } : prev);
                }
              }}
              className="shrink-0 rounded p-0.5 transition-colors hover:bg-accent"
              title={email.is_starred ? "Unstar" : "Star"}
            >
              <Star
                className={cn(
                  "h-5 w-5",
                  email.is_starred
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/40 hover:text-muted-foreground",
                )}
              />
            </button>
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
              {email.subject || "(No subject)"}
            </h1>
            {!email.is_read && (
              <Badge variant="secondary" className="shrink-0 text-xs">Unread</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={printMail}
            className="gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction({ archive: true })}
            disabled={isActioning}
            className="gap-1.5"
          >
            <ArchiveIcon className="h-3.5 w-3.5" />
            Archive
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction({ trash: true })}
            disabled={isActioning}
            className="gap-1.5 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
          {embedded ? (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => router.push("/inbox")}>
              Back
            </Button>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex gap-2">
            <span className="w-16 shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">From</span>
            <span>{formatAddress(email.sender)}</span>
          </div>
          {email.recipients.length > 0 && (
            <div className="flex gap-2">
              <span className="w-16 shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">To</span>
              <span>{email.recipients.map(formatAddress).join(", ")}</span>
            </div>
          )}
          {email.cc_recipients && email.cc_recipients.length > 0 && (
            <div className="flex gap-2">
              <span className="w-16 shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">CC</span>
              <span>{email.cc_recipients.map(formatAddress).join(", ")}</span>
            </div>
          )}
          {email.attachments && email.attachments.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Paperclip className="inline h-3.5 w-3.5" />
              </span>
              <span>
                {email.attachments.length === 1
                  ? "Attachment"
                  : `Attachments (${email.attachments.length})`}
              </span>
            </div>
          )}
          <div className="flex gap-2">
            <span className="w-16 shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</span>
            <span>{formatDate(email.received_at)}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-16 shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">Labels</span>
            <LabelPicker
              emailId={email.id}
              provider={provider}
              currentLabels={email.labels}
              onLabelsChange={handleLabelsChange}
            />
          </div>
        </div>
      </div>

      {/* AI Tools — at top for quick access */}
      {id && (
        <>
          <AiSummary emailId={id} provider={provider} />
        </>
      )}

      {/* Reply / Reply All / Forward */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToCompose("reply")}
          className="gap-1.5"
        >
          <Reply className="h-3.5 w-3.5" />
          Reply
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToCompose("replyAll")}
          className="gap-1.5"
        >
          <ReplyAll className="h-3.5 w-3.5" />
          Reply All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateToCompose("forward")}
          className="gap-1.5"
        >
          <Forward className="h-3.5 w-3.5" />
          Forward
        </Button>
      </div>

      {/* Body */}
      <div className="overflow-hidden rounded-lg border border-border bg-card p-4 md:p-6">
        <EmailBody html={email.body_html} text={email.body} />
      </div>

      {/* Attachments */}
      {email.attachments && email.attachments.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Paperclip className="h-4 w-4" />
            {email.attachments.length} attachment{email.attachments.length !== 1 ? "s" : ""}
          </div>
          <div className="flex flex-wrap gap-2">
            {email.attachments.map((att) => {
              const canPreview = isPreviewable(att.content_type);

              const fetchBlob = async () => {
                const api = createApiClient(getToken);
                const url = api.getAttachmentUrl(email.id, att.id, provider);
                const token = await getToken();
                const resp = await fetch(url, {
                  headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!resp.ok) return null;
                const raw = await resp.blob();
                const blob = new Blob([raw], { type: att.content_type });
                return URL.createObjectURL(blob);
              };

              const handlePreview = async () => {
                const blobUrl = await fetchBlob();
                if (blobUrl) setPreviewAtt({ attachment: att, blobUrl });
              };

              const handleDownload = async () => {
                const blobUrl = await fetchBlob();
                if (!blobUrl) return;
                const a = document.createElement("a");
                a.href = blobUrl;
                a.download = att.filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(blobUrl);
              };

              return (
                <div
                  key={att.id}
                  className="flex w-56 items-center gap-3 rounded-lg bg-muted/40 p-3 transition-colors hover:bg-muted/70"
                >
                  <button
                    type="button"
                    onClick={canPreview ? handlePreview : handleDownload}
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
                        onClick={handlePreview}
                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        title="Preview"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleDownload}
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

      {/* AI Draft & Chat */}
      {id && (
        <>
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDraft(!showDraft)}
            >
              {showDraft ? "Hide Draft" : "AI Draft Reply"}
            </Button>
            {showDraft && <AiDraft emailId={id} provider={provider} />}
          </div>
          <AiChat emailId={id} provider={provider} />
        </>
      )}

      {/* Bottom reply bar — hidden when embedded to save space */}
      {!embedded && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-4">
          <Button
            variant="default"
            size="sm"
            onClick={() => navigateToCompose("reply")}
            className="gap-1.5"
          >
            <Reply className="h-3.5 w-3.5" />
            Reply
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateToCompose("replyAll")}
            className="gap-1.5"
          >
            <ReplyAll className="h-3.5 w-3.5" />
            Reply All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateToCompose("forward")}
            className="gap-1.5"
          >
            <Forward className="h-3.5 w-3.5" />
            Forward
          </Button>
        </div>
      )}
    </div>
  );
}
