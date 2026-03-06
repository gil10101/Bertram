from supabase import Client


class MeetingRepository:
    def __init__(self, db: Client):
        self.db = db

    async def list_by_user(self, user_id: str) -> list[dict]:
        result = (
            self.db.table("meetings")
            .select("*")
            .eq("user_id", user_id)
            .order("start_time")
            .execute()
        )
        return result.data

    async def create(self, data: dict) -> dict:
        result = self.db.table("meetings").insert(data).execute()
        return result.data[0]

    async def delete(self, meeting_id: str, user_id: str) -> None:
        self.db.table("meetings").delete().eq("id", meeting_id).eq(
            "user_id", user_id
        ).execute()
