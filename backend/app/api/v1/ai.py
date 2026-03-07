import json

from fastapi import APIRouter, File, Form, UploadFile

from app.api.deps import CurrentUser, Provider
from app.services.ai import AIService

router = APIRouter()


@router.post("/summarize/{email_id}")
async def summarize_email(email_id: str, user: CurrentUser, provider: Provider):
    email = await provider.get_email(email_id)
    return await AIService.summarize(email)


@router.post("/draft-reply/{email_id}")
async def draft_reply(email_id: str, user: CurrentUser, provider: Provider, body: dict | None = None):
    email = await provider.get_email(email_id)
    instructions = body.get("instructions", "") if body else ""
    return await AIService.draft_reply(email, instructions)


@router.post("/prioritize")
async def prioritize_inbox(user: CurrentUser, provider: Provider):
    emails = await provider.list_emails(page=1, per_page=50)
    return await AIService.prioritize(emails)


@router.post("/classify/{email_id}")
async def classify_email(email_id: str, user: CurrentUser, provider: Provider):
    email = await provider.get_email(email_id)
    return await AIService.classify(email)


@router.post("/chat/{email_id}")
async def chat_about_email(email_id: str, user: CurrentUser, provider: Provider, body: dict):
    email = await provider.get_email(email_id)
    messages = body.get("messages", [])
    return await AIService.chat_about_email(email, messages)


@router.post("/compose-assist")
async def compose_assist(
    user: CurrentUser,
    data: str = Form(...),
    files: list[UploadFile] = File(default=[]),
):
    body = json.loads(data)
    attachments: list[tuple[str, str, bytes]] = []
    for f in files:
        file_bytes = await f.read()
        attachments.append((
            f.filename or "attachment",
            f.content_type or "application/octet-stream",
            file_bytes,
        ))
    return await AIService.compose_assist(
        subject=body.get("subject", ""),
        body=body.get("body", ""),
        instructions=body.get("instructions", ""),
        attachments=attachments,
    )
