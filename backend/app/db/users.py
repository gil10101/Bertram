from supabase import Client


class UserRepository:
    def __init__(self, db: Client):
        self.db = db

    async def get_or_create(self, clerk_id: str, email: str) -> dict:
        result = (
            self.db.table("users")
            .select("*")
            .eq("clerk_id", clerk_id)
            .single()
            .execute()
        )
        if result.data:
            return result.data

        new_user = {"clerk_id": clerk_id, "email": email}
        result = self.db.table("users").insert(new_user).execute()
        return result.data[0]

    async def update_preferences(self, user_id: str, preferences: dict) -> dict:
        result = (
            self.db.table("users")
            .update({"preferences": preferences})
            .eq("id", user_id)
            .execute()
        )
        return result.data[0]

    async def get_connected_providers(self, user_id: str) -> list[str]:
        result = (
            self.db.table("oauth_tokens")
            .select("provider")
            .eq("user_id", user_id)
            .execute()
        )
        return [row["provider"] for row in result.data]
