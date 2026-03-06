from datetime import datetime

from pydantic import BaseModel, EmailStr


class EmailAddress(BaseModel):
    name: str = ""
    email: EmailStr


class EmailMessage(BaseModel):
    id: str
    thread_id: str | None = None
    subject: str = ""
    sender: EmailAddress
    recipients: list[EmailAddress] = []
    body: str = ""
    snippet: str = ""
    labels: list[str] = []
    is_read: bool = False
    is_starred: bool = False
    received_at: datetime | None = None


class EmailThread(BaseModel):
    id: str
    subject: str = ""
    messages: list[EmailMessage] = []
    last_message_at: datetime | None = None
    participant_count: int = 0


class EmailSendRequest(BaseModel):
    to: list[EmailStr]
    cc: list[EmailStr] = []
    bcc: list[EmailStr] = []
    subject: str
    body: str


class EmailUpdateRequest(BaseModel):
    is_read: bool | None = None
    is_starred: bool | None = None
    labels: list[str] | None = None
