from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Query

from app.api.deps import CurrentUser, DB, get_calendar_service
from app.models.meeting import MeetingCreate, MeetingUpdate

router = APIRouter()


@router.get("/events")
async def list_events(
    user: CurrentUser,
    db: DB,
    start: str | None = Query(None),
    end: str | None = Query(None),
):
    service = await get_calendar_service(user, db)
    now = datetime.now(timezone.utc)
    start_dt = datetime.fromisoformat(start) if start else now - timedelta(days=30)
    end_dt = datetime.fromisoformat(end) if end else now + timedelta(days=60)
    return await service.list_events(start_dt, end_dt)


@router.post("/events")
async def create_event(user: CurrentUser, db: DB, body: MeetingCreate):
    service = await get_calendar_service(user, db)
    return await service.create_event(body)


@router.patch("/events/{meeting_id}")
async def update_event(meeting_id: str, user: CurrentUser, db: DB, body: MeetingUpdate):
    service = await get_calendar_service(user, db)
    return await service.update_event(meeting_id, body)


@router.delete("/events/{meeting_id}")
async def delete_event(meeting_id: str, user: CurrentUser, db: DB):
    service = await get_calendar_service(user, db)
    return await service.delete_event(meeting_id)
