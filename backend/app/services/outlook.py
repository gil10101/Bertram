import base64
import logging
from datetime import datetime, timezone
from typing import Any

import httpx
from postgrest.exceptions import APIError

from app.config import settings
from app.services.email_provider import AttachmentData, EmailProvider

logger = logging.getLogger(__name__)

GRAPH_BASE = "https://graph.microsoft.com/v1.0"
TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token"


def _parse_address(addr: dict | None) -> dict:
    if not addr:
        return {"name": "", "email": ""}
    ea = addr.get("emailAddress", addr)
    return {"name": ea.get("name", ""), "email": ea.get("address", "")}


def _parse_recipients(recipients: list[dict] | None) -> list[dict]:
    return [_parse_address(r) for r in (recipients or [])]


class OutlookProvider(EmailProvider):
    """Microsoft Graph API implementation of EmailProvider."""

    def __init__(self, user_id: str, db: Any):
        super().__init__(user_id, db)
        self._token_data: dict | None = None

    async def _get_access_token(self) -> str | None:
        if self._token_data and self._token_data.get("access_token"):
            return self._token_data["access_token"]

        try:
            token_row = (
                self.db.table("oauth_tokens")
                .select("*")
                .eq("user_id", self.user_id)
                .eq("provider", "outlook")
                .single()
                .execute()
            )
        except APIError:
            return None

        if not token_row.data:
            return None

        self._token_data = token_row.data
        token = await self._maybe_refresh(self._token_data)
        return token

    async def _maybe_refresh(self, token_data: dict) -> str | None:
        """Refresh the access token if it's likely expired."""
        from datetime import timedelta

        created = token_data.get("updated_at") or token_data.get("created_at")
        expires_in = token_data.get("expires_in", 3600)

        if created:
            try:
                if isinstance(created, str):
                    created_dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
                else:
                    created_dt = created
                expiry = created_dt + timedelta(seconds=expires_in - 300)
                if datetime.now(timezone.utc) < expiry:
                    return token_data["access_token"]
            except (ValueError, TypeError):
                pass

        refresh_token = token_data.get("refresh_token")
        if not refresh_token:
            return token_data["access_token"]

        async with httpx.AsyncClient() as client:
            resp = await client.post(
                TOKEN_URL,
                data={
                    "client_id": settings.outlook_client_id,
                    "client_secret": settings.outlook_client_secret,
                    "refresh_token": refresh_token,
                    "grant_type": "refresh_token",
                },
            )
            if resp.status_code != 200:
                logger.error("Outlook token refresh failed: %s", resp.text)
                return token_data["access_token"]
            tokens = resp.json()

        (
            self.db.table("oauth_tokens")
            .update({
                "access_token": tokens["access_token"],
                "refresh_token": tokens.get("refresh_token", refresh_token),
                "expires_in": tokens.get("expires_in", 3600),
            })
            .eq("user_id", self.user_id)
            .eq("provider", "outlook")
            .execute()
        )

        self._token_data = {**token_data, **tokens}
        return tokens["access_token"]

    async def _graph_get(self, path: str, params: dict | None = None) -> dict:
        token = await self._get_access_token()
        if not token:
            return {}
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{GRAPH_BASE}{path}",
                headers={"Authorization": f"Bearer {token}"},
                params=params,
            )
            if resp.status_code == 401:
                self._token_data = None
                token = await self._get_access_token()
                if not token:
                    return {}
                resp = await client.get(
                    f"{GRAPH_BASE}{path}",
                    headers={"Authorization": f"Bearer {token}"},
                    params=params,
                )
            resp.raise_for_status()
            return resp.json()

    async def _graph_post(self, path: str, json_body: dict) -> dict:
        token = await self._get_access_token()
        if not token:
            return {}
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{GRAPH_BASE}{path}",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json=json_body,
            )
            resp.raise_for_status()
            return resp.json() if resp.content else {}

    async def _graph_patch(self, path: str, json_body: dict) -> dict:
        token = await self._get_access_token()
        if not token:
            return {}
        async with httpx.AsyncClient() as client:
            resp = await client.patch(
                f"{GRAPH_BASE}{path}",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
                json=json_body,
            )
            resp.raise_for_status()
            return resp.json() if resp.content else {}

    async def _graph_delete(self, path: str) -> None:
        token = await self._get_access_token()
        if not token:
            return
        async with httpx.AsyncClient() as client:
            resp = await client.delete(
                f"{GRAPH_BASE}{path}",
                headers={"Authorization": f"Bearer {token}"},
            )
            resp.raise_for_status()

    def _format_message(self, msg: dict) -> dict:
        sender = _parse_address(msg.get("from"))
        recipients = _parse_recipients(msg.get("toRecipients"))
        cc_recipients = _parse_recipients(msg.get("ccRecipients"))
        received = msg.get("receivedDateTime", "")

        body = msg.get("body", {})
        body_html = body.get("content", "") if body.get("contentType") == "html" else ""
        body_text = body.get("content", "") if body.get("contentType") == "text" else ""
        if body_html and not body_text:
            body_text = ""

        categories = msg.get("categories", [])
        internet_message_id = msg.get("internetMessageId", "")

        attachments = []
        if msg.get("hasAttachments"):
            for att in msg.get("_attachments", []):
                attachments.append({
                    "id": att.get("id", ""),
                    "filename": att.get("name", "attachment"),
                    "content_type": att.get("contentType", "application/octet-stream"),
                    "size": att.get("size", 0),
                })

        return {
            "id": msg["id"],
            "thread_id": msg.get("conversationId", ""),
            "message_id": internet_message_id,
            "subject": msg.get("subject", "(no subject)"),
            "sender": sender,
            "recipients": recipients,
            "cc_recipients": cc_recipients,
            "snippet": msg.get("bodyPreview", ""),
            "body": body_text,
            "body_html": body_html,
            "labels": categories,
            "is_read": msg.get("isRead", False),
            "is_starred": msg.get("flag", {}).get("flagStatus") == "flagged",
            "received_at": received,
            "provider": "outlook",
            "attachments": attachments,
        }

    async def get_unread_count(self) -> int:
        data = await self._graph_get(
            "/me/mailFolders/inbox",
            params={"$select": "unreadItemCount"},
        )
        return data.get("unreadItemCount", 0)

    async def list_emails(self, page: int = 1, per_page: int = 20, q: str = "") -> list[dict]:
        skip = (page - 1) * per_page
        params: dict[str, str] = {
            "$top": str(per_page),
            "$skip": str(skip),
            "$orderby": "receivedDateTime desc",
            "$select": "id,conversationId,internetMessageId,subject,from,toRecipients,ccRecipients,bodyPreview,isRead,flag,categories,receivedDateTime,hasAttachments",
        }
        if q:
            params["$search"] = f'"{q}"'
            params.pop("$orderby")
        data = await self._graph_get("/me/mailFolders/inbox/messages", params=params)
        messages = data.get("value", [])
        return [self._format_message(m) for m in messages]

    async def get_email(self, email_id: str) -> dict:
        data = await self._graph_get(f"/me/messages/{email_id}")
        if not data or "id" not in data:
            return {}
        if data.get("hasAttachments"):
            att_data = await self._graph_get(f"/me/messages/{email_id}/attachments")
            data["_attachments"] = att_data.get("value", [])
        return self._format_message(data)

    async def get_attachment(self, email_id: str, attachment_id: str) -> AttachmentData:
        data = await self._graph_get(f"/me/messages/{email_id}/attachments/{attachment_id}")
        if not data or "id" not in data:
            raise ValueError("Attachment not found")
        raw_data = base64.b64decode(data.get("contentBytes", ""))
        return AttachmentData(
            filename=data.get("name", "attachment"),
            content_type=data.get("contentType", "application/octet-stream"),
            data=raw_data,
        )

    async def send_email(self, data: dict, attachments: list[tuple[str, str, bytes]] | None = None) -> dict:
        to_recipients = [
            {"emailAddress": {"address": addr}}
            for addr in data.get("to", [])
        ]
        cc_recipients = [
            {"emailAddress": {"address": addr}}
            for addr in data.get("cc", [])
        ]

        message: dict = {
            "subject": data.get("subject", ""),
            "body": {
                "contentType": "text",
                "content": data.get("body", ""),
            },
            "toRecipients": to_recipients,
        }
        if cc_recipients:
            message["ccRecipients"] = cc_recipients
        if data.get("thread_id"):
            message["conversationId"] = data["thread_id"]
        if data.get("in_reply_to"):
            message["internetMessageHeaders"] = [
                {"name": "In-Reply-To", "value": data["in_reply_to"]},
                {"name": "References", "value": data.get("references", data["in_reply_to"])},
            ]
        if attachments:
            message["attachments"] = [
                {
                    "@odata.type": "#microsoft.graph.fileAttachment",
                    "name": filename,
                    "contentType": content_type,
                    "contentBytes": base64.b64encode(file_bytes).decode(),
                }
                for filename, content_type, file_bytes in attachments
            ]

        await self._graph_post("/me/sendMail", {"message": message, "saveToSentItems": True})
        return {"status": "sent"}

    async def update_email(self, email_id: str, data: dict) -> dict:
        updates: dict = {}
        if "is_read" in data:
            updates["isRead"] = data["is_read"]
        if "is_starred" in data:
            updates["flag"] = {
                "flagStatus": "flagged" if data["is_starred"] else "notFlagged"
            }
        if updates:
            await self._graph_patch(f"/me/messages/{email_id}", updates)
        return {"status": "updated"}

    async def list_threads(self, page: int = 1, per_page: int = 20) -> list[dict]:
        """Outlook groups by conversationId; we fetch messages and group them."""
        data = await self._graph_get(
            "/me/mailFolders/inbox/messages",
            params={
                "$top": str(per_page * 3),
                "$orderby": "receivedDateTime desc",
                "$select": "id,conversationId,subject,receivedDateTime",
            },
        )

        seen: dict[str, dict] = {}
        for msg in data.get("value", []):
            cid = msg.get("conversationId", msg["id"])
            if cid not in seen:
                seen[cid] = {
                    "id": cid,
                    "subject": msg.get("subject", "(no subject)"),
                    "last_message_at": msg.get("receivedDateTime"),
                    "message_count": 1,
                }
            else:
                seen[cid]["message_count"] += 1

        threads = list(seen.values())
        start = (page - 1) * per_page
        return threads[start : start + per_page]

    async def get_thread(self, thread_id: str) -> dict:
        data: dict = {}

        # Try $filter first (works for most conversationIds)
        safe_id = thread_id.replace("'", "''")
        try:
            data = await self._graph_get(
                "/me/messages",
                params={
                    "$filter": f"conversationId eq '{safe_id}'",
                    "$orderby": "receivedDateTime asc",
                },
            )
        except Exception:
            logger.debug("Outlook $filter on conversationId failed for %s, falling back", thread_id)

        # Fallback: fetch recent messages and filter client-side
        if not data.get("value"):
            try:
                bulk = await self._graph_get(
                    "/me/messages",
                    params={
                        "$top": "50",
                        "$orderby": "receivedDateTime desc",
                        "$select": "id,conversationId,internetMessageId,subject,from,"
                                   "toRecipients,ccRecipients,body,bodyPreview,isRead,"
                                   "flag,categories,receivedDateTime,hasAttachments",
                    },
                )
                data = {
                    "value": [
                        m for m in bulk.get("value", [])
                        if m.get("conversationId") == thread_id
                    ]
                }
                # Sort ascending by date
                data["value"].sort(key=lambda m: m.get("receivedDateTime", ""))
            except Exception:
                logger.exception("Outlook get_thread fallback also failed for %s", thread_id)
                data = {}

        raw_messages = data.get("value", [])
        for msg in raw_messages:
            if msg.get("hasAttachments"):
                try:
                    att_data = await self._graph_get(f"/me/messages/{msg['id']}/attachments")
                    msg["_attachments"] = att_data.get("value", [])
                except Exception:
                    logger.warning("Failed to fetch attachments for message %s", msg["id"])
        messages = [self._format_message(m) for m in raw_messages]
        return {"id": thread_id, "messages": messages}

    async def list_labels(self) -> list[dict]:
        """Map Outlook mail folders to labels."""
        data = await self._graph_get("/me/mailFolders", params={"$top": "100"})
        return [
            {
                "id": folder["id"],
                "name": folder.get("displayName", ""),
                "type": "system" if folder.get("isHidden") is False else "user",
            }
            for folder in data.get("value", [])
        ]

    async def create_label(self, data: dict) -> dict:
        result = await self._graph_post(
            "/me/mailFolders",
            {"displayName": data.get("name", "")},
        )
        return {"id": result.get("id", ""), "name": result.get("displayName", "")}

    async def update_label(self, label_id: str, data: dict) -> dict:
        result = await self._graph_patch(
            f"/me/mailFolders/{label_id}",
            {"displayName": data.get("name", "")},
        )
        return {"id": result.get("id", ""), "name": result.get("displayName", "")}

    async def delete_label(self, label_id: str) -> dict:
        await self._graph_delete(f"/me/mailFolders/{label_id}")
        return {"status": "deleted"}
