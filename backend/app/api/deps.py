import logging
from typing import Annotated

from fastapi import Depends, HTTPException, Query, Request, status
from postgrest.exceptions import APIError

logger = logging.getLogger(__name__)

from app.auth.clerk import verify_clerk_token
from app.db.client import get_supabase
from app.db.users import UserRepository
from app.services.aggregate_provider import AggregateEmailProvider
from app.services.calendar_provider import CalendarProvider
from app.services.calendar_service import CalendarService
from app.services.email_provider import EmailProvider
from app.services.gmail import GmailProvider
from app.services.google_calendar import GoogleCalendarProvider
from app.services.outlook import OutlookProvider
from app.services.outlook_calendar import OutlookCalendarProvider

PROVIDER_REGISTRY: dict[str, type[EmailProvider]] = {
    "gmail": GmailProvider,
    "outlook": OutlookProvider,
}

CALENDAR_PROVIDER_REGISTRY: dict[str, type[CalendarProvider]] = {
    "gmail": GoogleCalendarProvider,
    "outlook": OutlookCalendarProvider,
}


def _build_provider(key: str, user_id: str, db: object) -> EmailProvider:
    cls = PROVIDER_REGISTRY.get(key)
    if cls is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown provider: {key}",
        )
    return cls(user_id=user_id, db=db)


async def get_current_user(request: Request) -> dict:
    token = request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    payload = await verify_clerk_token(token)

    # Upsert user into Supabase on each authenticated request
    try:
        db = get_supabase()
        email = payload.get("email", "") or payload.get("primary_email", "")
        repo = UserRepository(db)
        await repo.get_or_create(clerk_id=payload["sub"], email=email)
    except Exception:
        logger.warning("User upsert failed for %s", payload.get("sub"), exc_info=True)

    return payload


async def get_db():
    return get_supabase()


async def get_email_provider(
    user: Annotated[dict, Depends(get_current_user)],
    db=Depends(get_db),
    provider: str | None = Query(None, alias="provider"),
) -> EmailProvider:
    user_id = user["sub"]

    if provider and provider in PROVIDER_REGISTRY:
        return _build_provider(provider, user_id, db)

    try:
        result = (
            db.table("oauth_tokens")
            .select("provider")
            .eq("user_id", user_id)
            .execute()
        )
        connected = [row["provider"] for row in (result.data or []) if row["provider"] in PROVIDER_REGISTRY]
    except APIError:
        connected = []

    if len(connected) <= 1:
        key = connected[0] if connected else "gmail"
        return _build_provider(key, user_id, db)

    return AggregateEmailProvider(
        [_build_provider(p, user_id, db) for p in connected]
    )


async def get_calendar_service(user: dict, db: object) -> CalendarService:
    user_id = user["sub"]

    try:
        result = (
            db.table("oauth_tokens")
            .select("provider")
            .eq("user_id", user_id)
            .execute()
        )
        connected = [
            row["provider"]
            for row in (result.data or [])
            if row["provider"] in CALENDAR_PROVIDER_REGISTRY
        ]
    except APIError:
        connected = []

    providers = [
        CALENDAR_PROVIDER_REGISTRY[p](user_id=user_id, db=db)
        for p in connected
    ]

    return CalendarService(providers=providers, db=db, user_id=user_id)


CurrentUser = Annotated[dict, Depends(get_current_user)]
DB = Annotated[object, Depends(get_db)]
Provider = Annotated[EmailProvider, Depends(get_email_provider)]
