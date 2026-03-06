from fastapi import APIRouter

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
