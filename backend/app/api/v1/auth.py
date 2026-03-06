from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from postgrest.exceptions import APIError

from app.api.deps import CurrentUser, DB
from app.auth.oauth import OAuthService
from app.config import settings

FRONTEND_URL = settings.cors_origins[0] if settings.cors_origins else "http://localhost:3000"

router = APIRouter()


@router.get("/status")
async def connection_status(user: CurrentUser, db: DB):
    """Return which email providers the user has connected."""
    try:
        result = (
            db.table("oauth_tokens")
            .select("provider")
            .eq("user_id", user["sub"])
            .execute()
        )
        providers = [row["provider"] for row in result.data]
    except APIError:
        providers = []
    return {"connected_providers": providers}


@router.get("/gmail/connect")
async def gmail_connect(user: CurrentUser):
    return {"url": OAuthService.get_gmail_auth_url(user["sub"])}


@router.get("/gmail/callback")
async def gmail_callback(request: Request, code: str, state: str, db: DB):
    await OAuthService.handle_gmail_callback(code, state, db)
    return RedirectResponse(url=f"{FRONTEND_URL}/settings?connected=gmail")


@router.get("/outlook/connect")
async def outlook_connect(user: CurrentUser):
    return {"url": OAuthService.get_outlook_auth_url(user["sub"])}


@router.get("/outlook/callback")
async def outlook_callback(request: Request, code: str, state: str, db: DB):
    await OAuthService.handle_outlook_callback(code, state, db)
    return RedirectResponse(url=f"{FRONTEND_URL}/settings?connected=outlook")


@router.post("/disconnect/{provider}")
async def disconnect_provider(provider: str, user: CurrentUser, db: DB):
    await OAuthService.disconnect(user["sub"], provider, db)
    return {"status": "disconnected"}
