import base64

import anthropic

from app.config import settings

SUPPORTED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}


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
    async def _ask_multimodal(cls, system: str, content_blocks: list) -> str:
        response = await cls._get_client().messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2048,
            system=system,
            messages=[{"role": "user", "content": content_blocks}],
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

    @classmethod
    async def chat_about_email(
        cls,
        email: dict,
        messages: list[dict],
    ) -> dict:
        system = (
            "You are Bertram, an intelligent email assistant. "
            "You are helping the user understand and work with the following email.\n\n"
            f"Subject: {email.get('subject', '')}\n"
            f"From: {email.get('sender', {}).get('email', '') if isinstance(email.get('sender'), dict) else email.get('sender', '')}\n"
            f"Date: {email.get('received_at', '')}\n\n"
            f"Email body:\n{email.get('body', '')}\n\n"
            "Answer questions about this email, help draft responses, "
            "explain context, suggest actions, and provide any assistance the user needs. "
            "Be concise and helpful."
        )
        api_messages = []
        for m in messages:
            role = m.get("role", "user")
            if role not in ("user", "assistant"):
                role = "user"
            api_messages.append({"role": role, "content": str(m.get("content", ""))})
        response = await cls._get_client().messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system=system,
            messages=api_messages,
        )
        return {"reply": response.content[0].text}

    @classmethod
    async def compose_assist(
        cls,
        subject: str,
        body: str,
        instructions: str,
        attachments: list[tuple[str, str, bytes]],
    ) -> dict:
        content_blocks: list = []

        # Build the text context
        parts = []
        if subject:
            parts.append(f"Subject: {subject}")
        if body:
            parts.append(f"Current draft:\n{body}")
        if instructions:
            parts.append(f"Instructions: {instructions}")
        if parts:
            content_blocks.append({"type": "text", "text": "\n\n".join(parts)})

        # Process attachments into content blocks
        for filename, content_type, data in attachments:
            if content_type in SUPPORTED_IMAGE_TYPES:
                content_blocks.append({
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": content_type,
                        "data": base64.standard_b64encode(data).decode(),
                    },
                })
            elif content_type == "application/pdf":
                content_blocks.append({
                    "type": "document",
                    "source": {
                        "type": "base64",
                        "media_type": "application/pdf",
                        "data": base64.standard_b64encode(data).decode(),
                    },
                })
            elif content_type and content_type.startswith("text/"):
                try:
                    text = data.decode("utf-8")
                    content_blocks.append({
                        "type": "text",
                        "text": f"[Attachment: {filename}]\n{text}",
                    })
                except UnicodeDecodeError:
                    content_blocks.append({
                        "type": "text",
                        "text": f"[Attachment: {filename} — content not readable]",
                    })
            else:
                content_blocks.append({
                    "type": "text",
                    "text": f"[Attachment: {filename} — content not readable, {content_type}]",
                })

        if not content_blocks:
            content_blocks.append({"type": "text", "text": "Write a professional email."})

        draft_body = await cls._ask_multimodal(
            system=(
                "You are an email writing assistant. Write or improve the email body "
                "based on the subject, any attached documents, and user instructions. "
                "Output only the email body text, no subject line or metadata."
            ),
            content_blocks=content_blocks,
        )
        return {"draft_body": draft_body}
