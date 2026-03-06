from urllib.parse import urlencode

import httpx

from app.config import settings

GMAIL_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GMAIL_TOKEN_URL = "https://oauth2.googleapis.com/token"
GMAIL_SCOPES = "https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar"

OUTLOOK_AUTH_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
OUTLOOK_TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
OUTLOOK_SCOPES = "Mail.ReadWrite Mail.Send Calendars.ReadWrite offline_access"


class OAuthService:
    @staticmethod
    def get_gmail_auth_url(user_id: str) -> str:
        params = {
            "client_id": settings.gmail_client_id,
            "redirect_uri": settings.gmail_redirect_uri,
            "response_type": "code",
            "scope": GMAIL_SCOPES,
            "access_type": "offline",
            "prompt": "consent",
            "state": user_id,
        }
        return f"{GMAIL_AUTH_URL}?{urlencode(params)}"

    @staticmethod
    async def handle_gmail_callback(code: str, state: str, db) -> dict:
        async with httpx.AsyncClient() as client:
            resp = await client.post(GMAIL_TOKEN_URL, data={
                "code": code,
                "client_id": settings.gmail_client_id,
                "client_secret": settings.gmail_client_secret,
                "redirect_uri": settings.gmail_redirect_uri,
                "grant_type": "authorization_code",
            })
            resp.raise_for_status()
            tokens = resp.json()

        db.table("oauth_tokens").upsert({
            "user_id": state,
            "provider": "gmail",
            "access_token": tokens["access_token"],
            "refresh_token": tokens.get("refresh_token", ""),
            "expires_in": tokens.get("expires_in", 3600),
        }).execute()

        return tokens

    @staticmethod
    def get_outlook_auth_url(user_id: str) -> str:
        params = {
            "client_id": settings.outlook_client_id,
            "redirect_uri": settings.outlook_redirect_uri,
            "response_type": "code",
            "scope": OUTLOOK_SCOPES,
            "state": user_id,
        }
        return f"{OUTLOOK_AUTH_URL}?{urlencode(params)}"

    @staticmethod
    async def handle_outlook_callback(code: str, state: str, db) -> dict:
        async with httpx.AsyncClient() as client:
            resp = await client.post(OUTLOOK_TOKEN_URL, data={
                "code": code,
                "client_id": settings.outlook_client_id,
                "client_secret": settings.outlook_client_secret,
                "redirect_uri": settings.outlook_redirect_uri,
                "grant_type": "authorization_code",
            })
            resp.raise_for_status()
            tokens = resp.json()

        db.table("oauth_tokens").upsert({
            "user_id": state,
            "provider": "outlook",
            "access_token": tokens["access_token"],
            "refresh_token": tokens.get("refresh_token", ""),
            "expires_in": tokens.get("expires_in", 3600),
        }).execute()

        return tokens

    @staticmethod
    async def disconnect(user_id: str, provider: str, db) -> None:
        db.table("oauth_tokens").delete().eq("user_id", user_id).eq(
            "provider", provider
        ).execute()
