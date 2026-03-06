import anthropic

from app.config import settings


class AIService:
    """Claude API wrapper for email intelligence."""

    _client: anthropic.AsyncAnthropic | None = None

    @classmethod
    def _get_client(cls) -> anthropic.AsyncAnthropic:
        if cls._client is None:
            cls._client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
        return cls._client

    @classmethod
    async def _ask(cls, system: str, user_content: str) -> str:
        response = await cls._get_client().messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system=system,
            messages=[{"role": "user", "content": user_content}],
        )
        return response.content[0].text

    @classmethod
    async def summarize(cls, email: dict) -> dict:
        summary = await cls._ask(
            system="You are an email assistant. Summarize the email concisely in 2-3 sentences.",
            user_content=f"Subject: {email.get('subject', '')}\n\n{email.get('body', '')}",
        )
        return {"email_id": email.get("id"), "summary": summary}

    @classmethod
    async def draft_reply(cls, email: dict, instructions: str = "") -> dict:
        prompt = f"Subject: {email.get('subject', '')}\n\n{email.get('body', '')}"
        if instructions:
            prompt += f"\n\nUser instructions: {instructions}"

        draft = await cls._ask(
            system="You are an email assistant. Draft a professional reply to this email.",
            user_content=prompt,
        )
        return {"email_id": email.get("id"), "draft": draft}

    @classmethod
    async def prioritize(cls, emails: list[dict]) -> dict:
        summaries = "\n".join(
            f"- [{e.get('id')}] {e.get('subject', '(no subject)')}" for e in emails
        )
        result = await cls._ask(
            system="You are an email assistant. Rank these emails by priority (high/medium/low). Return JSON array with id and priority.",
            user_content=summaries,
        )
        return {"priorities": result}

    @classmethod
    async def classify(cls, email: dict) -> dict:
        label = await cls._ask(
            system="You are an email assistant. Classify this email into one category: meeting, action_required, fyi, newsletter, spam. Return only the category name.",
            user_content=f"Subject: {email.get('subject', '')}\n\n{email.get('body', '')}",
        )
        return {"email_id": email.get("id"), "category": label.strip().lower()}
