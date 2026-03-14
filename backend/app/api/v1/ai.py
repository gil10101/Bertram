import json

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.api.deps import CurrentUser, Provider
from app.services.ai import AIService

router = APIRouter()


def _get_user_name(user: dict) -> str:
    """Extract display name from Clerk JWT payload."""
    name = user.get("name") or ""
    if not name:
        first = user.get("first_name") or ""
        last = user.get("last_name") or ""
        name = f"{first} {last}".strip()
    return name


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
    result = await AIService.prioritize(emails)
    # Validate each priority entry has the expected shape
    valid = {"high", "medium", "low"}
    result["priorities"] = [
        p for p in result.get("priorities", [])
        if isinstance(p, dict) and "id" in p and p.get("priority") in valid
    ]
    return result


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
    try:
        body = json.loads(data)
    except (json.JSONDecodeError, TypeError):
        raise HTTPException(status_code=422, detail="Invalid JSON in 'data' field")
    attachments: list[tuple[str, str, bytes]] = []
    for f in files:
        file_bytes = await f.read()
        if len(file_bytes) > 25 * 1024 * 1024:
            raise HTTPException(
                status_code=413,
                detail=f"Attachment '{f.filename}' exceeds 25 MB limit",
            )
        attachments.append((
            f.filename or "attachment",
            f.content_type or "application/octet-stream",
            file_bytes,
        ))
    user_name = _get_user_name(user)
    return await AIService.compose_assist(
        subject=body.get("subject", ""),
        body=body.get("body", ""),
        instructions=body.get("instructions", ""),
        attachments=attachments,
        user_name=user_name,
    )


@router.post("/autocomplete")
async def autocomplete(user: CurrentUser, body: dict):
    return await AIService.autocomplete(
        text_before_cursor=body.get("text_before_cursor", ""),
        subject=body.get("subject", ""),
    )


@router.post("/compose-chat")
async def compose_chat(user: CurrentUser, body: dict):
    user_name = _get_user_name(user)
    return await AIService.compose_chat(
        subject=body.get("subject", ""),
        body=body.get("body", ""),
        to=body.get("to", ""),
        cc=body.get("cc", ""),
        messages=body.get("messages", []),
        user_name=user_name,
    )
