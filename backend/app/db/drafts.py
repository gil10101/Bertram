from datetime import datetime, timezone

from supabase import Client


class DraftRepository:
    def __init__(self, db: Client):
        self.db = db

    async def list_drafts(self, user_id: str) -> list[dict]:
        result = (
            self.db.table("drafts")
            .select("*")
            .eq("user_id", user_id)
            .order("updated_at", desc=True)
            .execute()
        )
        return result.data

    async def get_draft(self, user_id: str, draft_id: str) -> dict | None:
        result = (
            self.db.table("drafts")
            .select("*")
            .eq("id", draft_id)
            .eq("user_id", user_id)
            .execute()
        )
        return result.data[0] if result.data else None

    async def create_draft(self, user_id: str, data: dict) -> dict:
        row = {"user_id": user_id, **data}
        result = self.db.table("drafts").insert(row).execute()
        return result.data[0]

    async def update_draft(self, user_id: str, draft_id: str, data: dict) -> dict | None:
        # Filter out None values so we only update provided fields
        update_data = {k: v for k, v in data.items() if v is not None}
        if not update_data:
            return await self.get_draft(user_id, draft_id)
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        result = (
            self.db.table("drafts")
            .update(update_data)
            .eq("id", draft_id)
            .eq("user_id", user_id)
            .execute()
        )
        return result.data[0] if result.data else None

    async def delete_draft(self, user_id: str, draft_id: str) -> bool:
        result = (
            self.db.table("drafts")
            .delete()
            .eq("id", draft_id)
            .eq("user_id", user_id)
            .execute()
        )
        return bool(result.data)
