import logging
from typing import Literal, Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.api.deps import DB, CurrentUser

logger = logging.getLogger(__name__)

router = APIRouter()


class FeedbackCreate(BaseModel):
    type: Literal["bug", "feature"]
    title: str = Field(min_length=1, max_length=300)
    description: str = Field(min_length=1, max_length=10000)
    # Bug fields
    severity: Optional[str] = Field(default=None, max_length=50)
    area: Optional[str] = Field(default=None, max_length=50)
    # Feature fields
    category: Optional[str] = Field(default=None, max_length=50)
    importance: Optional[str] = Field(default=None, max_length=50)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_feedback(body: FeedbackCreate, user: CurrentUser, db: DB):
    """Store a bug report or feature request from an authenticated user."""
    metadata = {
        key: value
        for key, value in {
            "severity": body.severity,
            "area": body.area,
            "category": body.category,
            "importance": body.importance,
        }.items()
        if value
    }

    row = {
        "user_id": user["sub"],
        "email": user.get("email") or user.get("primary_email"),
        "type": body.type,
        "title": body.title,
        "description": body.description,
        "metadata": metadata,
    }

    try:
        result = db.table("feedback").insert(row).execute()
    except Exception as exc:  # noqa: BLE001
        logger.error("Failed to insert feedback for %s", user.get("sub"), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save feedback",
        ) from exc

    inserted = (result.data or [{}])[0]
    return {"ok": True, "id": inserted.get("id")}
