import logging
from datetime import datetime, timezone, timedelta
from typing import Any

import httpx
from postgrest.exceptions import APIError

from app.config import settings
from app.services.calendar_provider import CalendarProvider

logger = logging.getLogger(__name__)

GRAPH_BASE = "https://graph.microsoft.com/v1.0"
TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token"


def _normalize_event(event: dict) -> dict:
    start_raw = event.get("start", {})
    end_raw = event.get("end", {})
    start_dt = start_raw.get("dateTime", "")
    end_dt = end_raw.get("dateTime", "")
    tz = start_raw.get("timeZone", "UTC")

    if start_dt and "Z" not in start_dt and "+" not in start_dt:
        start_dt = start_dt + "Z" if tz == "UTC" else start_dt

    if end_dt and "Z" not in end_dt and "+" not in end_dt:
        end_dt = end_dt + "Z" if tz == "UTC" else end_dt

    attendees = []
    for a in event.get("attendees", []):
        ea = a.get("emailAddress", {})
        attendees.append(ea.get("address", ""))

    location_raw = event.get("location", {})
    location = location_raw.get("displayName", "") if isinstance(location_raw, dict) else ""

    body_raw = event.get("body", {})
    description = body_raw.get("content", "") if isinstance(body_raw, dict) else ""

    return {
        "id": event["id"],
        "title": event.get("subject", "(No title)"),
        "start_time": start_dt,
        "end_time": end_dt,
        "attendees": attendees,
        "description": description,
        "location": location,
        "source": "outlook",
    }


def _build_event_body(data: dict) -> dict:
    body: dict[str, Any] = {}
    if "title" in data:
        body["subject"] = data["title"]
    if "description" in data:
        body["body"] = {"contentType": "text", "content": data["description"]}
    if "location" in data:
        body["location"] = {"displayName": data["location"]}
    if "start_time" in data:
        body["start"] = {"dateTime": data["start_time"], "timeZone": "UTC"}
    if "end_time" in data:
        body["end"] = {"dateTime": data["end_time"], "timeZone": "UTC"}
    if "attendees" in data:
        body["attendees"] = [
            {"emailAddress": {"address": e}, "type": "required"}
            for e in data["attendees"]
        ]
    return body


class OutlookCalendarProvider(CalendarProvider):
    """Microsoft Graph Calendar API integration."""

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
        return await self._maybe_refresh(self._token_data)

    async def _maybe_refresh(self, token_data: dict) -> str | None:
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

    async def _graph_request(
        self, method: str, path: str, params: dict | None = None, json_body: dict | None = None
    ) -> dict:
        token = await self._get_access_token()
        if not token:
            return {}
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

        async with httpx.AsyncClient() as client:
            resp = await client.request(
                method, f"{GRAPH_BASE}{path}", headers=headers, params=params, json=json_body
            )
            if resp.status_code == 401:
                self._token_data = None
                token = await self._get_access_token()
                if not token:
                    return {}
                headers["Authorization"] = f"Bearer {token}"
                resp = await client.request(
                    method, f"{GRAPH_BASE}{path}", headers=headers, params=params, json=json_body
                )
            if resp.status_code == 204:
                return {}
            resp.raise_for_status()
            return resp.json() if resp.content else {}

    async def list_events(self, start: datetime, end: datetime) -> list[dict]:
        start_str = start.isoformat() + "Z" if not start.tzinfo else start.isoformat()
        end_str = end.isoformat() + "Z" if not end.tzinfo else end.isoformat()

        data = await self._graph_request(
            "GET",
            "/me/calendarView",
            params={
                "startDateTime": start_str,
                "endDateTime": end_str,
                "$orderby": "start/dateTime",
                "$top": "250",
                "$select": "id,subject,start,end,attendees,body,location",
            },
        )
        return [_normalize_event(e) for e in data.get("value", [])]

    async def create_event(self, data: dict) -> dict:
        body = _build_event_body(data)
        result = await self._graph_request("POST", "/me/events", json_body=body)
        if not result or "id" not in result:
            return {}
        return _normalize_event(result)

    async def update_event(self, event_id: str, data: dict) -> dict:
        body = _build_event_body(data)
        result = await self._graph_request("PATCH", f"/me/events/{event_id}", json_body=body)
        if not result or "id" not in result:
            return {}
        return _normalize_event(result)

    async def delete_event(self, event_id: str) -> None:
        await self._graph_request("DELETE", f"/me/events/{event_id}")
