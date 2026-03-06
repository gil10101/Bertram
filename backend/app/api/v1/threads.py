from fastapi import APIRouter, Query

from app.api.deps import CurrentUser, Provider

router = APIRouter()


@router.get("")
async def list_threads(
    user: CurrentUser,
    provider: Provider,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    return await provider.list_threads(page=page, per_page=per_page)


@router.get("/{thread_id}")
async def get_thread(thread_id: str, user: CurrentUser, provider: Provider):
    return await provider.get_thread(thread_id)
