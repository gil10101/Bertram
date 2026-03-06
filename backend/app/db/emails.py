from supabase import Client


class EmailRepository:
    def __init__(self, db: Client):
        self.db = db

    async def get_cached_emails(self, user_id: str, limit: int = 50) -> list[dict]:
        result = (
            self.db.table("emails")
            .select("*")
            .eq("user_id", user_id)
            .order("received_at", desc=True)
            .limit(limit)
            .execute()
        )
        return result.data

    async def upsert_email(self, user_id: str, email_data: dict) -> dict:
        row = {"user_id": user_id, **email_data}
        result = self.db.table("emails").upsert(row).execute()
        return result.data[0]

    async def update_email_metadata(self, email_id: str, data: dict) -> dict:
        result = self.db.table("emails").update(data).eq("id", email_id).execute()
        return result.data[0] if result.data else {}
