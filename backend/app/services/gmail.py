import base64
import logging
import mimetypes
from datetime import datetime, timezone
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email import encoders
from typing import Any

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from postgrest.exceptions import APIError

from app.config import settings
from app.services.email_provider import AttachmentData, EmailProvider

logger = logging.getLogger(__name__)

GMAIL_TOKEN_URL = "https://oauth2.googleapis.com/token"


def _parse_headers(headers: list[dict]) -> dict[str, str]:
    return {h["name"].lower(): h["value"] for h in headers}


def _parse_address(raw: str) -> dict:
    """Turn 'Name <email>' into {'name': ..., 'email': ...}."""
    if "<" in raw and ">" in raw:
        name = raw[: raw.index("<")].strip().strip('"')
        email = raw[raw.index("<") + 1 : raw.index(">")].strip()
    else:
        name, email = "", raw.strip()
    return {"name": name, "email": email}


def _build_service(token_data: dict):
    creds = Credentials(
        token=token_data["access_token"],
        refresh_token=token_data.get("refresh_token"),
        token_uri=GMAIL_TOKEN_URL,
        client_id=settings.gmail_client_id,
        client_secret=settings.gmail_client_secret,
    )
    return build("gmail", "v1", credentials=creds, cache_discovery=False)


class GmailProvider(EmailProvider):
    """Gmail API implementation of EmailProvider."""

    def __init__(self, user_id: str, db: Any):
        super().__init__(user_id, db)
        self._service = None

    async def _get_service(self):
        if self._service is not None:
            return self._service
        try:
            token_row = (
                self.db.table("oauth_tokens")
                .select("*")
                .eq("user_id", self.user_id)
                .eq("provider", "gmail")
                .single()
                .execute()
            )
        except APIError:
            return None
        if not token_row.data:
            return None
        self._service = _build_service(token_row.data)
        return self._service

    def _format_message(self, msg: dict) -> dict:
        payload = msg.get("payload", {})
        headers = _parse_headers(payload.get("headers", []))
        label_ids = msg.get("labelIds", [])
        internal_ts = int(msg.get("internalDate", "0")) / 1000

        sender = _parse_address(headers.get("from", ""))
        recipients = [
            _parse_address(r.strip())
            for r in headers.get("to", "").split(",")
            if r.strip()
        ]
        cc_recipients = [
            _parse_address(r.strip())
            for r in headers.get("cc", "").split(",")
            if r.strip()
        ]

        body_html, body_text = self._extract_bodies(payload)
        attachments = self._extract_attachments(payload)

        return {
            "id": msg["id"],
            "thread_id": msg.get("threadId"),
            "message_id": headers.get("message-id", ""),
            "subject": headers.get("subject", "(no subject)"),
            "sender": sender,
            "recipients": recipients,
            "cc_recipients": cc_recipients,
            "snippet": msg.get("snippet", ""),
            "body": body_text,
            "body_html": body_html,
            "labels": label_ids,
            "is_read": "UNREAD" not in label_ids,
            "is_starred": "STARRED" in label_ids,
            "received_at": datetime.fromtimestamp(internal_ts, tz=timezone.utc).isoformat(),
            "provider": "gmail",
            "attachments": attachments,
        }

    @staticmethod
    def _decode_part(part: dict) -> str:
        data = part.get("body", {}).get("data", "")
        if not data:
            return ""
        return base64.urlsafe_b64decode(data).decode("utf-8", errors="replace")

    @classmethod
    def _extract_attachments(cls, payload: dict) -> list[dict]:
        """Pull attachment metadata from all parts of the message."""
        attachments: list[dict] = []
        for part in payload.get("parts", []):
            filename = part.get("filename")
            body = part.get("body", {})
            if filename and (body.get("attachmentId") or body.get("size", 0) > 0):
                attachments.append({
                    "id": body.get("attachmentId", ""),
                    "filename": filename,
                    "content_type": part.get("mimeType", "application/octet-stream"),
                    "size": body.get("size", 0),
                })
            if part.get("parts"):
                attachments.extend(cls._extract_attachments(part))
        return attachments

    @classmethod
    def _extract_bodies(cls, payload: dict) -> tuple[str, str]:
        """Return (html, plain_text) from a message payload."""
        html = ""
        text = ""

        mime = payload.get("mimeType", "")
        if mime == "text/html" and payload.get("body", {}).get("data"):
            html = cls._decode_part(payload)
        elif mime == "text/plain" and payload.get("body", {}).get("data"):
            text = cls._decode_part(payload)

        for part in payload.get("parts", []):
            part_mime = part.get("mimeType", "")
            if part_mime == "text/html" and not html and part.get("body", {}).get("data"):
                html = cls._decode_part(part)
            elif part_mime == "text/plain" and not text and part.get("body", {}).get("data"):
                text = cls._decode_part(part)
            elif part.get("parts"):
                sub_html, sub_text = cls._extract_bodies(part)
                if not html:
                    html = sub_html
                if not text:
                    text = sub_text

        return html, text

    async def get_unread_count(self) -> int:
        service = await self._get_service()
        if not service:
            return 0
        result = (
            service.users()
            .messages()
            .list(userId="me", maxResults=1, q="in:inbox is:unread")
            .execute()
        )
        return result.get("resultSizeEstimate", 0)

    async def list_emails(self, page: int = 1, per_page: int = 20, q: str = "") -> list[dict]:
        service = await self._get_service()
        if not service:
            return []

        gmail_q = f"in:inbox {q}".strip() if q else "in:inbox"
        result = (
            service.users()
            .messages()
            .list(userId="me", maxResults=per_page, q=gmail_q)
            .execute()
        )
        message_ids = result.get("messages", [])
        if not message_ids:
            return []

        emails = []
        for msg_ref in message_ids:
            msg = (
                service.users()
                .messages()
                .get(userId="me", id=msg_ref["id"], format="full")
                .execute()
            )
            emails.append(self._format_message(msg))
        return emails

    async def get_email(self, email_id: str) -> dict:
        service = await self._get_service()
        if not service:
            return {}
        msg = (
            service.users()
            .messages()
            .get(userId="me", id=email_id, format="full")
            .execute()
        )
        return self._format_message(msg)

    async def get_attachment(self, email_id: str, attachment_id: str) -> AttachmentData:
        service = await self._get_service()
        if not service:
            raise ValueError("Gmail not connected")
        att = (
            service.users()
            .messages()
            .attachments()
            .get(userId="me", messageId=email_id, id=attachment_id)
            .execute()
        )
        raw_data = base64.urlsafe_b64decode(att["data"])

        msg = (
            service.users()
            .messages()
            .get(userId="me", id=email_id, format="full")
            .execute()
        )
        attachment_meta = next(
            (
                a
                for a in self._extract_attachments(msg.get("payload", {}))
                if a["id"] == attachment_id
            ),
            None,
        )
        return AttachmentData(
            filename=attachment_meta["filename"] if attachment_meta else "attachment",
            content_type=attachment_meta["content_type"] if attachment_meta else "application/octet-stream",
            data=raw_data,
        )

    async def send_email(self, data: dict, attachments: list[tuple[str, str, bytes]] | None = None) -> dict:
        service = await self._get_service()
        if not service:
            return {"status": "error", "detail": "Gmail not connected"}

        if attachments:
            message = MIMEMultipart()
            message.attach(MIMEText(data.get("body", "")))
            for filename, content_type, file_bytes in attachments:
                maintype, subtype = content_type.split("/", 1) if "/" in content_type else ("application", "octet-stream")
                part = MIMEBase(maintype, subtype)
                part.set_payload(file_bytes)
                encoders.encode_base64(part)
                part.add_header("Content-Disposition", "attachment", filename=filename)
                message.attach(part)
        else:
            message = MIMEText(data.get("body", ""))

        message["to"] = ", ".join(data.get("to", []))
        message["subject"] = data.get("subject", "")
        if data.get("cc"):
            message["cc"] = ", ".join(data["cc"])
        if data.get("in_reply_to"):
            message["In-Reply-To"] = data["in_reply_to"]
            message["References"] = data.get("references", data["in_reply_to"])
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        send_body: dict[str, Any] = {"raw": raw}
        if data.get("thread_id"):
            send_body["threadId"] = data["thread_id"]
        service.users().messages().send(userId="me", body=send_body).execute()
        return {"status": "sent"}

    async def update_email(self, email_id: str, data: dict) -> dict:
        service = await self._get_service()
        if not service:
            return {"status": "error", "detail": "Gmail not connected"}
        add_labels: list[str] = []
        remove_labels: list[str] = []
        if data.get("is_read") is True:
            remove_labels.append("UNREAD")
        elif data.get("is_read") is False:
            add_labels.append("UNREAD")
        if data.get("is_starred") is True:
            add_labels.append("STARRED")
        elif data.get("is_starred") is False:
            remove_labels.append("STARRED")
        if add_labels or remove_labels:
            service.users().messages().modify(
                userId="me",
                id=email_id,
                body={"addLabelIds": add_labels, "removeLabelIds": remove_labels},
            ).execute()
        return {"status": "updated"}

    async def list_threads(self, page: int = 1, per_page: int = 20) -> list[dict]:
        service = await self._get_service()
        if not service:
            return []
        result = (
            service.users()
            .threads()
            .list(userId="me", maxResults=per_page, q="in:inbox")
            .execute()
        )
        threads = []
        for t_ref in result.get("threads", []):
            t = (
                service.users()
                .threads()
                .get(userId="me", id=t_ref["id"], format="metadata")
                .execute()
            )
            msgs = t.get("messages", [])
            hdrs = _parse_headers(msgs[-1].get("payload", {}).get("headers", [])) if msgs else {}
            threads.append({
                "id": t["id"],
                "subject": hdrs.get("subject", "(no subject)"),
                "last_message_at": datetime.fromtimestamp(
                    int(msgs[-1].get("internalDate", "0")) / 1000, tz=timezone.utc
                ).isoformat() if msgs else None,
                "message_count": len(msgs),
            })
        return threads

    async def get_thread(self, thread_id: str) -> dict:
        service = await self._get_service()
        if not service:
            return {}
        t = (
            service.users()
            .threads()
            .get(userId="me", id=thread_id, format="full")
            .execute()
        )
        return {
            "id": t["id"],
            "messages": [self._format_message(m) for m in t.get("messages", [])],
        }

    async def list_labels(self) -> list[dict]:
        service = await self._get_service()
        if not service:
            return []
        result = service.users().labels().list(userId="me").execute()
        return [
            {"id": lb["id"], "name": lb["name"], "type": lb.get("type", "user")}
            for lb in result.get("labels", [])
        ]

    async def create_label(self, data: dict) -> dict:
        service = await self._get_service()
        if not service:
            return {}
        lb = service.users().labels().create(
            userId="me",
            body={"name": data.get("name", ""), "labelListVisibility": "labelShow", "messageListVisibility": "show"},
        ).execute()
        return {"id": lb["id"], "name": lb["name"]}

    async def update_label(self, label_id: str, data: dict) -> dict:
        service = await self._get_service()
        if not service:
            return {}
        lb = service.users().labels().update(
            userId="me", id=label_id, body={"name": data.get("name", "")},
        ).execute()
        return {"id": lb["id"], "name": lb["name"]}

    async def delete_label(self, label_id: str) -> dict:
        service = await self._get_service()
        if not service:
            return {"status": "error"}
        service.users().labels().delete(userId="me", id=label_id).execute()
        return {"status": "deleted"}
