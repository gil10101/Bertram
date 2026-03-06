import asyncio
import logging
import re
from datetime import datetime
from typing import Any

from postgrest.exceptions import APIError

from app.models.meeting import MeetingCreate, MeetingUpdate
from app.services.calendar_provider import CalendarProvider

logger = logging.getLogger(__name__)

UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.I)


class CalendarService:
    """Aggregates events from multiple calendar providers and manages the local Supabase mapping."""

    def __init__(self, providers: list[CalendarProvider], db: Any, user_id: str):
        self._providers = providers
        self.db = db
        self.user_id = user_id

    def _provider_by_source(self, source: str) -> CalendarProvider | None:
        mapping = {"google": "GoogleCalendarProvider", "outlook": "OutlookCalendarProvider"}
        cls_name = mapping.get(source)
        if not cls_name:
            return None
        for p in self._providers:
            if type(p).__name__ == cls_name:
                return p
        return None

    @staticmethod
    def _normalize_dt(raw: str) -> str:
        """Parse a datetime string into a canonical UTC ISO format for comparison."""
        if not raw:
            return ""
        try:
            cleaned = raw.replace("Z", "+00:00")
            dt = datetime.fromisoformat(cleaned)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=None)
            else:
                from datetime import timezone as tz
                dt = dt.astimezone(tz.utc)
            return dt.strftime("%Y-%m-%dT%H:%M")
        except (ValueError, TypeError):
            return raw

    @classmethod
    def _deduplicate(cls, events: list[dict]) -> list[dict]:
        """Merge duplicate events across providers into a single entry with a providers list."""
        key_map: dict[str, int] = {}
        unique: list[dict] = []
        for e in events:
            title = (e.get("title") or "").strip().lower()
            start = cls._normalize_dt(e.get("start_time", ""))
            end = cls._normalize_dt(e.get("end_time", ""))
            key = f"{title}|{start}|{end}"
            source = e.get("source", "bertram")
            if key in key_map:
                existing = unique[key_map[key]]
                if source not in existing["providers"]:
                    existing["providers"].append(source)
            else:
                e["providers"] = [source]
                key_map[key] = len(unique)
                unique.append(e)
        return unique

    def _find_local_meeting(self, event_id: str) -> dict | None:
        """Look up a meeting in Supabase by UUID, then by external provider ID."""
        if UUID_RE.match(event_id):
            try:
                result = (
                    self.db.table("meetings")
                    .select("*")
                    .eq("id", event_id)
                    .eq("user_id", self.user_id)
                    .single()
                    .execute()
                )
                if result.data:
                    return result.data
            except APIError:
                pass

        for col in ("google_event_id", "outlook_event_id"):
            try:
                result = (
                    self.db.table("meetings")
                    .select("*")
                    .eq(col, event_id)
                    .eq("user_id", self.user_id)
                    .limit(1)
                    .execute()
                )
                if result.data:
                    return result.data[0]
            except APIError:
                pass

        return None

    async def list_events(self, start: datetime, end: datetime) -> list[dict]:
        if not self._providers:
            rows = (
                self.db.table("meetings")
                .select("*")
                .eq("user_id", self.user_id)
                .gte("start_time", start.isoformat())
                .lte("start_time", end.isoformat())
                .order("start_time")
                .execute()
            )
            return rows.data or []

        results = await asyncio.gather(
            *(p.list_events(start, end) for p in self._providers),
            return_exceptions=True,
        )

        merged: list[dict] = []
        for res in results:
            if isinstance(res, BaseException):
                logger.warning("Calendar provider fetch failed: %s", res)
                continue
            merged.extend(res)

        merged.sort(key=lambda e: e.get("start_time", ""))
        return self._deduplicate(merged)

    async def create_event(self, data: MeetingCreate) -> dict:
        event_data = {
            "title": data.title,
            "start_time": data.start_time.isoformat(),
            "end_time": data.end_time.isoformat(),
            "attendees": data.attendees,
            "description": data.description,
            "location": data.location,
        }

        google_event_id = None
        outlook_event_id = None

        push_results = await asyncio.gather(
            *(p.create_event(event_data) for p in self._providers),
            return_exceptions=True,
        )

        for i, res in enumerate(push_results):
            if isinstance(res, BaseException):
                logger.warning("Failed to create event in provider: %s", res)
                continue
            provider_name = type(self._providers[i]).__name__
            if provider_name == "GoogleCalendarProvider" and res.get("id"):
                google_event_id = res["id"]
            elif provider_name == "OutlookCalendarProvider" and res.get("id"):
                outlook_event_id = res["id"]

        row = {
            "user_id": self.user_id,
            "title": data.title,
            "start_time": data.start_time.isoformat(),
            "end_time": data.end_time.isoformat(),
            "attendees": data.attendees,
            "description": data.description,
            "location": data.location,
            "source": "bertram",
            "google_event_id": google_event_id,
            "outlook_event_id": outlook_event_id,
        }
        result = self.db.table("meetings").insert(row).execute()
        return result.data[0] if result.data else row

    async def update_event(self, meeting_id: str, data: MeetingUpdate) -> dict:
        meeting = self._find_local_meeting(meeting_id)

        updates = data.model_dump(exclude_none=True)
        if not updates:
            return meeting or {}

        update_payload = {}
        for key, val in updates.items():
            if key in ("start_time", "end_time") and val is not None:
                update_payload[key] = val.isoformat()
            else:
                update_payload[key] = val

        external_data = {**update_payload}

        if meeting:
            if "title" not in external_data and "title" in meeting:
                external_data["title"] = meeting["title"]

            push_tasks = []
            if meeting.get("google_event_id"):
                google_provider = self._provider_by_source("google")
                if google_provider:
                    push_tasks.append(google_provider.update_event(meeting["google_event_id"], external_data))
            if meeting.get("outlook_event_id"):
                outlook_provider = self._provider_by_source("outlook")
                if outlook_provider:
                    push_tasks.append(outlook_provider.update_event(meeting["outlook_event_id"], external_data))

            if push_tasks:
                results = await asyncio.gather(*push_tasks, return_exceptions=True)
                for res in results:
                    if isinstance(res, BaseException):
                        logger.warning("Failed to update event in provider: %s", res)

            result = (
                self.db.table("meetings")
                .update(update_payload)
                .eq("id", meeting["id"])
                .eq("user_id", self.user_id)
                .execute()
            )
            return result.data[0] if result.data else {**meeting, **update_payload}

        # External-only event: try updating directly in providers
        push_tasks = []
        for p in self._providers:
            push_tasks.append(p.update_event(meeting_id, external_data))
        if push_tasks:
            results = await asyncio.gather(*push_tasks, return_exceptions=True)
            for res in results:
                if isinstance(res, BaseException):
                    logger.warning("Failed to update external event: %s", res)
                elif isinstance(res, dict) and res.get("id"):
                    return res
        return {"status": "updated"}

    async def delete_event(self, meeting_id: str) -> dict:
        meeting = self._find_local_meeting(meeting_id)

        if meeting:
            push_tasks = []
            if meeting.get("google_event_id"):
                google_provider = self._provider_by_source("google")
                if google_provider:
                    push_tasks.append(google_provider.delete_event(meeting["google_event_id"]))
            if meeting.get("outlook_event_id"):
                outlook_provider = self._provider_by_source("outlook")
                if outlook_provider:
                    push_tasks.append(outlook_provider.delete_event(meeting["outlook_event_id"]))

            if push_tasks:
                results = await asyncio.gather(*push_tasks, return_exceptions=True)
                for res in results:
                    if isinstance(res, BaseException):
                        logger.warning("Failed to delete event from provider: %s", res)

            self.db.table("meetings").delete().eq("id", meeting["id"]).eq(
                "user_id", self.user_id
            ).execute()

            return {"status": "deleted"}

        # External-only event: try deleting directly from each provider
        push_tasks = []
        for p in self._providers:
            push_tasks.append(p.delete_event(meeting_id))
        if push_tasks:
            results = await asyncio.gather(*push_tasks, return_exceptions=True)
            for res in results:
                if isinstance(res, BaseException):
                    logger.warning("Failed to delete external event: %s", res)

        return {"status": "deleted"}
