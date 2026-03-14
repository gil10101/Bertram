import base64
import json
import logging

import anthropic

from app.config import settings

logger = logging.getLogger(__name__)

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
            system=(
                "You are an email assistant. Rank these emails by priority (high, medium, or low). "
                "Respond with ONLY valid JSON, no markdown fences or extra text. "
                'Use this exact format: [{"id": "...", "priority": "high"}, ...]'
            ),
            user_content=summaries,
        )
        try:
            parsed = json.loads(result)
            # Accept both a raw list and a wrapped {"priorities": [...]} object
            if isinstance(parsed, list):
                priorities = parsed
            elif isinstance(parsed, dict) and "priorities" in parsed:
                priorities = parsed["priorities"]
            else:
                priorities = []
            return {"priorities": priorities}
        except (json.JSONDecodeError, TypeError) as exc:
            logger.warning("Failed to parse AI prioritize response: %s", exc)
            return {"priorities": []}

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
            "You are helping the user understand and work with an email they will provide. "
            "Answer questions about the email, help draft responses, "
            "explain context, suggest actions, and provide any assistance the user needs. "
            "Be concise and helpful."
        )

        sender = email.get("sender", "")
        if isinstance(sender, dict):
            sender = sender.get("email", "")

        email_context = (
            f"Here is the email I need help with:\n\n"
            f"Subject: {email.get('subject', '')}\n"
            f"From: {sender}\n"
            f"Date: {email.get('received_at', '')}\n\n"
            f"Email body:\n{email.get('body', '')}"
        )

        api_messages = [
            {"role": "user", "content": email_context},
            {"role": "assistant", "content": "I've reviewed this email. How can I help you with it?"},
        ]
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
        user_name: str = "",
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

        sign_off_instruction = ""
        if user_name:
            sign_off_instruction = (
                f" The user's name is {user_name} — when including a sign-off "
                f"(e.g. 'Best regards', 'Thanks'), follow it with a newline and their name."
            )
        draft_body = await cls._ask_multimodal(
            system=(
                "You are an email writing assistant. Write or improve the email body "
                "based on the subject, any attached documents, and user instructions. "
                "Output only the email body text, no subject line or metadata. "
                "Use proper paragraph spacing: separate paragraphs with blank lines. "
                "Structure emails clearly: greeting, body paragraphs, sign-off, name. "
                "Never output a wall of text — emails should be easy to scan."
                + sign_off_instruction
            ),
            content_blocks=content_blocks,
        )
        return {"draft_body": draft_body}

    @classmethod
    async def autocomplete(
        cls,
        text_before_cursor: str,
        subject: str = "",
    ) -> dict:
        """Fast autocomplete suggestion for email composition."""
        context = ""
        if subject:
            context = f"Email subject: {subject}\n\n"

        response = await cls._get_client().messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=150,
            system=(
                "You are an email autocomplete assistant. Given the text written so far, "
                "predict and complete the current sentence or thought. "
                "Output ONLY the completion text (the part that comes after what's already written). "
                "Keep it brief (1-2 sentences max). Do not repeat any of the existing text. "
                "If the text seems complete or you cannot suggest a natural continuation, "
                "respond with exactly: NONE"
            ),
            messages=[{"role": "user", "content": f"{context}Text so far:\n{text_before_cursor}"}],
        )
        completion = response.content[0].text.strip()
        if completion == "NONE" or not completion:
            return {"completion": ""}
        return {"completion": completion}

    @classmethod
    async def compose_chat(
        cls,
        subject: str,
        body: str,
        to: str,
        cc: str,
        messages: list[dict],
        user_name: str = "",
    ) -> dict:
        """Multi-turn chat for compose assistance with field modifications."""
        # Static system prompt — no draft content, stays small across turns
        system = (
            "You are Bertram, an AI email writing assistant.\n\n"
        )
        if user_name:
            system += f"The user's name is: {user_name}\n\n"
        system += (
            "When you need to update any email field, wrap each in its own XML tag:\n"
            "- <updated_to>emails</updated_to> for To recipients\n"
            "- <updated_cc>emails</updated_cc> for CC recipients\n"
            "- <updated_subject>text</updated_subject> for the subject\n"
            "- <updated_body>full body</updated_body> for the body\n\n"
            "Only include tags for fields that actually need to change. "
            "After the tags, briefly explain what you changed. "
            "If the user asks a question without requesting changes, respond "
            "conversationally without tags.\n\n"
            "Email formatting rules:\n"
            "- Separate paragraphs with blank lines.\n"
            "- Sign-offs get their own line, followed by the user's name"
            + (f" ({user_name})" if user_name else "") + ".\n"
            "- Structure: greeting, body paragraphs, sign-off, name."
        )

        # Build messages — only attach email state to the LAST user message
        api_messages = []
        for m in messages:
            role = m.get("role", "user")
            if role not in ("user", "assistant"):
                role = "user"
            api_messages.append({"role": role, "content": str(m.get("content", ""))})

        # Inject current email state into the final user message
        if api_messages and api_messages[-1]["role"] == "user":
            context_parts = []
            if to:
                context_parts.append(f"To: {to}")
            if cc:
                context_parts.append(f"CC: {cc}")
            if subject:
                context_parts.append(f"Subject: {subject}")
            if body:
                context_parts.append(f"Draft:\n{body}")
            if context_parts:
                context = "[Current email state]\n" + "\n".join(context_parts)
                original = api_messages[-1]["content"]
                api_messages[-1]["content"] = f"{context}\n\n[User request]\n{original}"

        response = await cls._get_client().messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2048,
            system=system,
            messages=api_messages,
        )

        reply_text = response.content[0].text

        result: dict = {"reply": reply_text}

        # Extract each field if present
        tag_map = {
            "updated_to": "updated_to",
            "updated_cc": "updated_cc",
            "updated_subject": "updated_subject",
            "updated_body": "updated_body",
        }
        for tag, key in tag_map.items():
            open_tag = f"<{tag}>"
            close_tag = f"</{tag}>"
            if open_tag in reply_text and close_tag in reply_text:
                start = reply_text.index(open_tag) + len(open_tag)
                end = reply_text.index(close_tag)
                result[key] = reply_text[start:end].strip()
                reply_text = reply_text[:reply_text.index(open_tag)] + reply_text[end + len(close_tag):]

        reply_text = reply_text.strip()
        if not reply_text:
            reply_text = "Done — I've updated the email."
        result["reply"] = reply_text

        return result
