from datetime import datetime

from pydantic import BaseModel, EmailStr


class DraftCreate(BaseModel):
    to: list[str] = []
    cc: list[str] = []
    bcc: list[str] = []
    subject: str = ""
    body: str = ""
    mode: str = "new"
    thread_id: str | None = None
    in_reply_to: str | None = None
    references: str | None = None


class DraftUpdate(BaseModel):
    to: list[str] | None = None
    cc: list[str] | None = None
    bcc: list[str] | None = None
    subject: str | None = None
    body: str | None = None
    mode: str | None = None
    thread_id: str | None = None
    in_reply_to: str | None = None
    references: str | None = None


class Draft(BaseModel):
    id: str
    user_id: str
    to: list[str] = []
    cc: list[str] = []
    bcc: list[str] = []
    subject: str = ""
    body: str = ""
    mode: str = "new"
    thread_id: str | None = None
    in_reply_to: str | None = None
    references: str | None = None
    created_at: datetime
    updated_at: datetime
