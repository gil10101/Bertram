const AVATAR_COLORS = [
  "bg-red-900/60",
  "bg-orange-900/60",
  "bg-amber-900/60",
  "bg-yellow-900/60",
  "bg-lime-900/60",
  "bg-green-900/60",
  "bg-emerald-900/60",
  "bg-teal-900/60",
  "bg-cyan-900/60",
  "bg-sky-900/60",
  "bg-blue-900/60",
  "bg-indigo-900/60",
  "bg-violet-900/60",
  "bg-purple-900/60",
  "bg-fuchsia-900/60",
  "bg-pink-900/60",
  "bg-rose-900/60",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getAvatarColor(email: string): string {
  return AVATAR_COLORS[hashString(email.toLowerCase()) % AVATAR_COLORS.length];
}

export function getInitial(name: string, email: string): string {
  const source = name || email;
  return source.charAt(0).toUpperCase();
}

export function formatEmailDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function formatFullDate(iso: string): string {
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

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDateRange(first: string, last: string): string {
  const f = new Date(first);
  const l = new Date(last);
  const opts: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" };
  if (f.toDateString() === l.toDateString()) {
    return f.toLocaleDateString(undefined, opts);
  }
  return `${f.toLocaleDateString(undefined, opts)} – ${l.toLocaleDateString(undefined, opts)}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileTypeStyle(contentType: string): { bg: string; text: string; label: string } {
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

export interface EmailAddress {
  name: string;
  email: string;
}

export function formatAddress(addr: EmailAddress): string {
  return addr.name ? `${addr.name} <${addr.email}>` : addr.email;
}

export function buildQuotedBody(email: {
  sender: EmailAddress;
  received_at: string;
  subject: string;
  recipients: EmailAddress[];
  cc_recipients?: EmailAddress[];
  body: string;
}): string {
  const header =
    `\n\n---------- Original Message ----------\n` +
    `From: ${formatAddress(email.sender)}\n` +
    `Date: ${formatFullDate(email.received_at)}\n` +
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

export function addSubjectPrefix(subject: string, prefix: "Re" | "Fwd"): string {
  const stripped = subject.replace(/^(Re|Fwd|Fw):\s*/i, "");
  return `${prefix}: ${stripped}`;
}
