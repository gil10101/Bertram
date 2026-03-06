from fastapi import APIRouter

from app.api.deps import CurrentUser, DB
from app.models.meeting import MeetingCreate, MeetingSuggestRequest
from app.services.scheduler import SchedulerService

router = APIRouter()


@router.get("")
async def list_meetings(user: CurrentUser, db: DB):
    return await SchedulerService(db).list_meetings(user["sub"])


@router.post("")
async def create_meeting(user: CurrentUser, db: DB, body: MeetingCreate):
    return await SchedulerService(db).create_meeting(user["sub"], body)


@router.post("/suggest")
async def suggest_times(user: CurrentUser, db: DB, body: MeetingSuggestRequest):
    return await SchedulerService(db).suggest_times(user["sub"], body)


@router.delete("/{meeting_id}")
async def cancel_meeting(meeting_id: str, user: CurrentUser, db: DB):
    return await SchedulerService(db).cancel_meeting(user["sub"], meeting_id)
