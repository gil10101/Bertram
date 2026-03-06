import re
from datetime import datetime, timezone


def normalize_email(email: str) -> str:
    return email.strip().lower()


def parse_date(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def truncate(text: str, max_length: int = 200) -> str:
    if len(text) <= max_length:
        return text
    return text[: max_length - 3] + "..."


def strip_html(html: str) -> str:
    return re.sub(r"<[^>]+>", "", html).strip()
