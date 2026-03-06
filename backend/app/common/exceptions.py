from fastapi import HTTPException, status


class ProviderNotConnectedError(HTTPException):
    def __init__(self, provider: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email provider '{provider}' is not connected. Please connect it in settings.",
        )


class EmailNotFoundError(HTTPException):
    def __init__(self, email_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Email '{email_id}' not found.",
        )


class MeetingConflictError(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail="The requested time slot conflicts with an existing meeting.",
        )


class AIServiceError(HTTPException):
    def __init__(self, detail: str = "AI service temporarily unavailable"):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=detail,
        )
