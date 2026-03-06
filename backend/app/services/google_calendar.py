import logging
from datetime import datetime
from typing import Any

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from postgrest.exceptions import APIError

from app.config import settings
from app.services.calendar_provider import CalendarProvider

logger = logging.getLogger(__name__)

GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"


def _build_calendar_service(token_data: dict):
    creds = Credentials(
        token=token_data["access_token"],
        refresh_token=token_data.get("refresh_token"),
        token_uri=GOOGLE_TOKEN_URL,
        client_id=settings.gmail_client_id,
        client_secret=settings.gmail_client_secret,
    )
    return build("calendar", "v3", credentials=creds, cache_discovery=False)


def _normalize_event(event: dict) -> dict:
    start_raw = event.get("start", {})
    end_raw = event.get("end", {})
    start_dt = start_raw.get("dateTime", start_raw.get("date", ""))
    end_dt = end_raw.get("dateTime", end_raw.get("date", ""))

    attendees = []
    for a in event.get("attendees", []):
        attendees.append(a.get("email", ""))

    return {
        "id": event["id"],
        "title": event.get("summary", "(No title)"),
        "start_time": start_dt,
        "end_time": end_dt,
        "attendees": attendees,
        "description": event.get("description", ""),
        "location": event.get("location", ""),
        "source": "google",
    }


def _build_event_body(data: dict) -> dict:
    body: dict[str, Any] = {}
    if "title" in data:
        body["summary"] = data["title"]
    if "description" in data:
        body["description"] = data["description"]
    if "location" in data:
        body["location"] = data["location"]
    if "start_time" in data:
        body["start"] = {"dateTime": data["start_time"], "timeZone": "UTC"}
    if "end_time" in data:
        body["end"] = {"dateTime": data["end_time"], "timeZone": "UTC"}
    if "attendees" in data:
        body["attendees"] = [{"email": e} for e in data["attendees"]]
    return body


class GoogleCalendarProvider(CalendarProvider):
    """Google Calendar API v3 integration."""

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
        self._service = _build_calendar_service(token_row.data)
        return self._service

    async def list_events(self, start: datetime, end: datetime) -> list[dict]:
        service = await self._get_service()
        if not service:
            return []
        result = (
            service.events()
            .list(
                calendarId="primary",
                timeMin=start.isoformat() + "Z" if not start.tzinfo else start.isoformat(),
                timeMax=end.isoformat() + "Z" if not end.tzinfo else end.isoformat(),
                singleEvents=True,
                orderBy="startTime",
                maxResults=250,
            )
            .execute()
        )
        return [_normalize_event(e) for e in result.get("items", [])]

    async def create_event(self, data: dict) -> dict:
        service = await self._get_service()
        if not service:
            return {}
        body = _build_event_body(data)
        event = service.events().insert(calendarId="primary", body=body).execute()
        return _normalize_event(event)

    async def update_event(self, event_id: str, data: dict) -> dict:
        service = await self._get_service()
        if not service:
            return {}
        body = _build_event_body(data)
        event = (
            service.events()
            .patch(calendarId="primary", eventId=event_id, body=body)
            .execute()
        )
        return _normalize_event(event)

    async def delete_event(self, event_id: str) -> None:
        service = await self._get_service()
        if not service:
            return
        service.events().delete(calendarId="primary", eventId=event_id).execute()
