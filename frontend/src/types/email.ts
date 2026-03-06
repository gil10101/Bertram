export interface EmailAddress {
  name: string;
  email: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  content_type: string;
  size: number;
}

export interface Email {
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
  priority?: "high" | "medium" | "low";
}

export interface ThreadSummary {
  id: string;
  subject: string;
  last_message_at: string | null;
  message_count: number;
}

export interface ThreadDetail {
  id: string;
  messages: Email[];
}

export interface EmailSendRequest {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  thread_id?: string;
  in_reply_to?: string;
  references?: string;
}

export type ComposeMode = "new" | "reply" | "replyAll" | "forward";

export interface ComposeData {
  mode: ComposeMode;
  to: string;
  cc: string;
  subject: string;
  body: string;
  thread_id?: string;
  in_reply_to?: string;
  references?: string;
}

export interface EmailUpdateRequest {
  is_read?: boolean;
  is_starred?: boolean;
  labels?: string[];
}

export interface Draft {
  id: string;
  user_id: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
  mode: ComposeMode;
  thread_id?: string | null;
  in_reply_to?: string | null;
  references?: string | null;
  created_at: string;
  updated_at: string;
}
