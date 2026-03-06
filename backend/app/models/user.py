from pydantic import BaseModel


class UserPreferences(BaseModel):
    timezone: str = "UTC"
    default_provider: str = "gmail"
    ai_auto_summarize: bool = False
    ai_auto_prioritize: bool = True


class UserProfile(BaseModel):
    id: str
    clerk_id: str
    email: str
    display_name: str = ""
    preferences: UserPreferences = UserPreferences()
    connected_providers: list[str] = []
