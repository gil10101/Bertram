from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any


class CalendarProvider(ABC):
    """Abstract base for calendar integrations (Google, Outlook, etc.)."""

    def __init__(self, user_id: str, db: Any):
        self.user_id = user_id
        self.db = db

    @abstractmethod
    async def list_events(
        self, start: datetime, end: datetime
    ) -> list[dict]:
        ...

    @abstractmethod
    async def create_event(self, data: dict) -> dict:
        ...

    @abstractmethod
    async def update_event(self, event_id: str, data: dict) -> dict:
        ...

    @abstractmethod
    async def delete_event(self, event_id: str) -> None:
        ...
