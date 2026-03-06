from typing import Any

from app.models.meeting import MeetingCreate, MeetingSuggestRequest


class SchedulerService:
    """Meeting scheduling logic backed by Supabase."""

    def __init__(self, db: Any):
        self.db = db

    async def list_meetings(self, user_id: str) -> list[dict]:
        result = (
            self.db.table("meetings")
            .select("*")
            .eq("user_id", user_id)
            .order("start_time")
            .execute()
        )
        return result.data

    async def create_meeting(self, user_id: str, data: MeetingCreate) -> dict:
        row = {
            "user_id": user_id,
            "title": data.title,
            "start_time": data.start_time.isoformat(),
            "end_time": data.end_time.isoformat(),
            "attendees": data.attendees,
            "description": data.description,
            "location": data.location,
        }
        result = self.db.table("meetings").insert(row).execute()
        return result.data[0]

    async def suggest_times(self, user_id: str, data: MeetingSuggestRequest) -> dict:
        # TODO: integrate with calendar free/busy lookup
        return {"suggestions": []}

    async def cancel_meeting(self, user_id: str, meeting_id: str) -> dict:
        self.db.table("meetings").delete().eq("id", meeting_id).eq(
            "user_id", user_id
        ).execute()
        return {"status": "cancelled"}
