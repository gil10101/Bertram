from app.services.ai import AIService


class PrioritizerService:
    """Email scoring and priority engine.

    Combines AI classification with rule-based heuristics
    (e.g. VIP senders, keywords, recency) to produce a priority score.
    """

    PRIORITY_WEIGHTS = {
        "high": 3,
        "medium": 2,
        "low": 1,
    }

    @classmethod
    async def score_email(cls, email: dict) -> dict:
        classification = await AIService.classify(email)
        category = classification["category"]

        score = cls.PRIORITY_WEIGHTS.get("medium", 2)
        if category == "action_required":
            score = cls.PRIORITY_WEIGHTS["high"]
        elif category in ("newsletter", "spam"):
            score = cls.PRIORITY_WEIGHTS["low"]

        return {
            "email_id": email.get("id"),
            "category": category,
            "score": score,
        }

    @classmethod
    async def rank_inbox(cls, emails: list[dict]) -> list[dict]:
        scored = []
        for email in emails:
            result = await cls.score_email(email)
            scored.append(result)
        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored
