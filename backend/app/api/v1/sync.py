import asyncio
import json
import logging
from typing import AsyncGenerator

from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from app.api.deps import PROVIDER_REGISTRY, _build_provider
from app.db.client import get_supabase
from app.services.aggregate_provider import AggregateEmailProvider
from postgrest.exceptions import APIError

logger = logging.getLogger(__name__)

router = APIRouter()

POLL_INTERVAL = 30  # seconds


async def _resolve_provider(user_id: str, db: object):
    """Build the email provider for a user (same logic as deps.get_email_provider)."""
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
            if row["provider"] in PROVIDER_REGISTRY
        ]
    except APIError:
        connected = []

    if len(connected) <= 1:
        key = connected[0] if connected else "gmail"
        return _build_provider(key, user_id, db)

    return AggregateEmailProvider(
        [_build_provider(p, user_id, db) for p in connected]
    )


async def _event_generator(user_id: str, db: object) -> AsyncGenerator[str, None]:
    """Yield SSE events when new emails are detected."""
    known_ids: set[str] = set()
    first_poll = True

    # Resolve provider once per SSE session (not every poll)
    provider = await _resolve_provider(user_id, db)

    while True:
        try:
            # Lightweight unread count — single API call per provider
            unread_count = await provider.get_unread_count()
            # Small fetch for new-email detection only
            recent = await provider.list_emails(page=1, per_page=10)
            current_ids = {e["id"] for e in recent}

            if first_poll:
                known_ids = current_ids
                first_poll = False
                data = json.dumps({"type": "connected", "unread_count": unread_count})
                yield f"event: connected\ndata: {data}\n\n"
            else:
                new_ids = current_ids - known_ids
                if new_ids:
                    new_emails = [e for e in recent if e["id"] in new_ids]
                    known_ids = current_ids
                    data = json.dumps({
                        "type": "new_emails",
                        "count": len(new_emails),
                        "unread_count": unread_count,
                        "emails": [
                            {
                                "id": e["id"],
                                "subject": e.get("subject", ""),
                                "sender": e.get("sender", {}),
                                "snippet": e.get("snippet", ""),
                                "provider": e.get("provider", ""),
                            }
                            for e in new_emails
                        ],
                    })
                    yield f"event: new_emails\ndata: {data}\n\n"
                else:
                    data = json.dumps({"type": "heartbeat", "unread_count": unread_count})
                    yield f"event: heartbeat\ndata: {data}\n\n"

        except asyncio.CancelledError:
            return
        except Exception:
            logger.exception("Sync poll failed")
            yield f"event: error\ndata: {json.dumps({'type': 'error', 'message': 'Poll failed'})}\n\n"

        await asyncio.sleep(POLL_INTERVAL)


@router.get("/stream")
async def sync_stream(token: str = Query(...)):
    """SSE endpoint for real-time email sync.

    Uses query-param auth because EventSource does not support custom headers.
    """
    # Authenticate manually using the token from query string
    fake_user = await get_current_user_from_token(token)
    user_id = fake_user["sub"]
    db = get_supabase()

    return StreamingResponse(
        _event_generator(user_id, db),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


async def get_current_user_from_token(token: str) -> dict:
    """Verify a raw JWT token (same as get_current_user but without Request)."""
    from app.auth.clerk import verify_clerk_token

    return await verify_clerk_token(token)
