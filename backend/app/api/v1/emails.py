import json
import os

from fastapi import APIRouter, File, Form, Query, UploadFile
from fastapi.responses import Response

from fastapi import HTTPException

from app.api.deps import CurrentUser, Provider

MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024  # 25 MB per file

router = APIRouter()


@router.get("")
async def list_emails(
    user: CurrentUser,
    provider: Provider,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    q: str = Query("", max_length=500),
    folder: str = Query("inbox", pattern=r"^[a-zA-Z]+$", max_length=20),
):
    return await provider.list_emails(page=page, per_page=per_page, q=q, folder=folder)


@router.get("/{email_id}")
async def get_email(email_id: str, user: CurrentUser, provider: Provider):
    return await provider.get_email(email_id)


@router.get("/{email_id}/attachments/{attachment_id}")
async def download_attachment(
    email_id: str,
    attachment_id: str,
    user: CurrentUser,
    provider: Provider,
):
    att = await provider.get_attachment(email_id, attachment_id)
    safe_name = os.path.basename(att.filename).replace('"', "_")
    return Response(
        content=att.data,
        media_type=att.content_type,
        headers={"Content-Disposition": f'inline; filename="{safe_name}"'},
    )


@router.post("/send")
async def send_email(
    user: CurrentUser,
    provider: Provider,
    data: str = Form(...),
    files: list[UploadFile] = File(default=[]),
):
    body = json.loads(data)
    attachments: list[tuple[str, str, bytes]] | None = None
    if files:
        attachments = []
        for f in files:
            file_bytes = await f.read()
            if len(file_bytes) > MAX_ATTACHMENT_SIZE:
                raise HTTPException(
                    status_code=413,
                    detail=f"Attachment '{f.filename}' exceeds 25 MB limit",
                )
            attachments.append((
                f.filename or "attachment",
                f.content_type or "application/octet-stream",
                file_bytes,
            ))
    return await provider.send_email(body, attachments=attachments)


@router.patch("/{email_id}")
async def update_email(email_id: str, user: CurrentUser, provider: Provider, body: dict):
    return await provider.update_email(email_id, body)
