from datetime import datetime

from pydantic import BaseModel, EmailStr


class TimeSlot(BaseModel):
    start: datetime
    end: datetime


class MeetingCreate(BaseModel):
    title: str
    start_time: datetime
    end_time: datetime
    attendees: list[EmailStr] = []
    description: str = ""
    location: str = ""


class MeetingUpdate(BaseModel):
    title: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    attendees: list[str] | None = None
    description: str | None = None
    location: str | None = None


class MeetingResponse(BaseModel):
    id: str
    user_id: str
    title: str
    start_time: datetime
    end_time: datetime
    attendees: list[str] = []
    description: str = ""
    location: str = ""
    source: str = "bertram"
    google_event_id: str | None = None
    outlook_event_id: str | None = None
    created_at: datetime | None = None


class MeetingSuggestRequest(BaseModel):
    duration_minutes: int = 30
    attendees: list[str] = []
    preferred_range: TimeSlot | None = None
