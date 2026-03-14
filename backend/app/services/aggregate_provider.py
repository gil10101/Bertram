import asyncio
import logging
from typing import Any

from app.services.email_provider import AttachmentData, EmailProvider

logger = logging.getLogger(__name__)


class AggregateEmailProvider(EmailProvider):
    """Merges results from multiple email providers, sorted by received_at."""

    def __init__(self, providers: list[EmailProvider]):
        self._providers = providers
        self.user_id = providers[0].user_id if providers else ""
        self.db = providers[0].db if providers else None

    async def get_unread_count(self) -> int:
        results = await asyncio.gather(
            *(p.get_unread_count() for p in self._providers),
            return_exceptions=True,
        )
        total = 0
        for res in results:
            if isinstance(res, int):
                total += res
        return total

    async def list_emails(self, page: int = 1, per_page: int = 20, q: str = "", folder: str = "inbox", category: str = "") -> list[dict]:
        results = await asyncio.gather(
            *(p.list_emails(page=page, per_page=per_page, q=q, folder=folder, category=category) for p in self._providers),
            return_exceptions=True,
        )
        merged: list[dict] = []
        for res in results:
            if isinstance(res, BaseException):
                logger.warning("Provider fetch failed: %s: %s", type(res).__name__, res)
                continue
            merged.extend(res)

        merged.sort(key=lambda e: e.get("received_at", ""), reverse=True)
        return merged[:per_page]

    async def get_email(self, email_id: str) -> dict:
        for p in self._providers:
            try:
                return await p.get_email(email_id)
            except Exception:
                continue
        raise ValueError(f"Email {email_id} not found in any provider")

    async def send_email(self, data: dict, attachments: list[tuple[str, str, bytes]] | None = None) -> dict:
        return await self._providers[0].send_email(data, attachments=attachments)

    async def get_attachment(self, email_id: str, attachment_id: str) -> AttachmentData:
        for p in self._providers:
            try:
                return await p.get_attachment(email_id, attachment_id)
            except Exception:
                continue
        raise ValueError(f"Attachment {attachment_id} not found in any provider")

    async def update_email(self, email_id: str, data: dict) -> dict:
        for p in self._providers:
            try:
                return await p.update_email(email_id, data)
            except Exception:
                continue
        raise ValueError(f"Email {email_id} not found in any provider")

    async def list_threads(self, page: int = 1, per_page: int = 20) -> list[dict]:
        results = await asyncio.gather(
            *(p.list_threads(page=page, per_page=per_page) for p in self._providers),
            return_exceptions=True,
        )
        merged: list[dict] = []
        for res in results:
            if isinstance(res, BaseException):
                continue
            merged.extend(res)
        return merged[:per_page]

    async def get_thread(self, thread_id: str) -> dict:
        for p in self._providers:
            try:
                return await p.get_thread(thread_id)
            except Exception:
                continue
        raise ValueError(f"Thread {thread_id} not found in any provider")

    async def list_labels(self) -> list[dict]:
        results = await asyncio.gather(
            *(p.list_labels() for p in self._providers),
            return_exceptions=True,
        )
        merged: list[dict] = []
        for res in results:
            if isinstance(res, BaseException):
                continue
            merged.extend(res)
        return merged

    async def create_label(self, data: dict) -> dict:
        return await self._providers[0].create_label(data)

    async def update_label(self, label_id: str, data: dict) -> dict:
        return await self._providers[0].update_label(label_id, data)

    async def delete_label(self, label_id: str) -> dict:
        return await self._providers[0].delete_label(label_id)
