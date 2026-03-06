from fastapi import APIRouter

from app.api.v1 import ai, auth, calendar, drafts, emails, labels, meetings, sync, threads

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(emails.router, prefix="/emails", tags=["emails"])
api_router.include_router(threads.router, prefix="/threads", tags=["threads"])
api_router.include_router(meetings.router, prefix="/meetings", tags=["meetings"])
api_router.include_router(calendar.router, prefix="/calendar", tags=["calendar"])
api_router.include_router(labels.router, prefix="/labels", tags=["labels"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(sync.router, prefix="/sync", tags=["sync"])
api_router.include_router(drafts.router, prefix="/drafts", tags=["drafts"])
