from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, DB
from app.db.drafts import DraftRepository
from app.models.draft import DraftCreate, DraftUpdate

router = APIRouter()


@router.get("")
async def list_drafts(user: CurrentUser, db: DB):
    repo = DraftRepository(db)
    return await repo.list_drafts(user["sub"])


@router.get("/{draft_id}")
async def get_draft(draft_id: str, user: CurrentUser, db: DB):
    repo = DraftRepository(db)
    draft = await repo.get_draft(user["sub"], draft_id)
    if not draft:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Draft not found")
    return draft


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_draft(body: DraftCreate, user: CurrentUser, db: DB):
    repo = DraftRepository(db)
    return await repo.create_draft(user["sub"], body.model_dump())


@router.put("/{draft_id}")
async def update_draft(draft_id: str, body: DraftUpdate, user: CurrentUser, db: DB):
    repo = DraftRepository(db)
    draft = await repo.update_draft(user["sub"], draft_id, body.model_dump())
    if not draft:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Draft not found")
    return draft


@router.delete("/{draft_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_draft(draft_id: str, user: CurrentUser, db: DB):
    repo = DraftRepository(db)
    deleted = await repo.delete_draft(user["sub"], draft_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Draft not found")
