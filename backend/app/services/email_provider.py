from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass
class AttachmentData:
    filename: str
    content_type: str
    data: bytes


class EmailProvider(ABC):
    """Abstract interface that Gmail and Outlook providers must implement."""

    def __init__(self, user_id: str, db: Any):
        self.user_id = user_id
        self.db = db

    async def get_unread_count(self) -> int:
        """Return the number of unread emails. Override for efficient provider-specific queries."""
        emails = await self.list_emails(page=1, per_page=50)
        return sum(1 for e in emails if not e.get("is_read", True))

    @abstractmethod
    async def list_emails(self, page: int = 1, per_page: int = 20, q: str = "") -> list[dict]:
        ...

    @abstractmethod
    async def get_email(self, email_id: str) -> dict:
        ...

    @abstractmethod
    async def send_email(self, data: dict, attachments: list[tuple[str, str, bytes]] | None = None) -> dict:
        """Send an email. attachments is a list of (filename, content_type, file_bytes)."""
        ...

    @abstractmethod
    async def get_attachment(self, email_id: str, attachment_id: str) -> AttachmentData:
        """Download a specific attachment by id."""
        ...

    @abstractmethod
    async def update_email(self, email_id: str, data: dict) -> dict:
        ...

    @abstractmethod
    async def list_threads(self, page: int = 1, per_page: int = 20) -> list[dict]:
        ...

    @abstractmethod
    async def get_thread(self, thread_id: str) -> dict:
        ...

    @abstractmethod
    async def list_labels(self) -> list[dict]:
        ...

    @abstractmethod
    async def create_label(self, data: dict) -> dict:
        ...

    @abstractmethod
    async def update_label(self, label_id: str, data: dict) -> dict:
        ...

    @abstractmethod
    async def delete_label(self, label_id: str) -> dict:
        ...
