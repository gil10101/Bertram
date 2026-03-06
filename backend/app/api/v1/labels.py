from fastapi import APIRouter

from app.api.deps import CurrentUser, Provider

router = APIRouter()


@router.get("")
async def list_labels(user: CurrentUser, provider: Provider):
    return await provider.list_labels()


@router.post("")
async def create_label(user: CurrentUser, provider: Provider, body: dict):
    return await provider.create_label(body)


@router.put("/{label_id}")
async def update_label(label_id: str, user: CurrentUser, provider: Provider, body: dict):
    return await provider.update_label(label_id, body)


@router.delete("/{label_id}")
async def delete_label(label_id: str, user: CurrentUser, provider: Provider):
    return await provider.delete_label(label_id)
