import httpx
import jwt
from fastapi import HTTPException, status

from app.config import settings

_jwks_cache: dict | None = None


async def _get_jwks() -> dict:
    global _jwks_cache
    if _jwks_cache is None:
        async with httpx.AsyncClient() as client:
            resp = await client.get(settings.clerk_jwks_url)
            resp.raise_for_status()
            _jwks_cache = resp.json()
    return _jwks_cache


async def verify_clerk_token(token: str) -> dict:
    """Decode and verify a Clerk-issued JWT. Returns the payload."""
    try:
        jwks = await _get_jwks()
        header = jwt.get_unverified_header(token)

        key = None
        for k in jwks.get("keys", []):
            if k["kid"] == header.get("kid"):
                key = jwt.algorithms.RSAAlgorithm.from_jwk(k)
                break

        if key is None:
            raise ValueError("Matching JWK not found")

        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
        return payload

    except (jwt.PyJWTError, ValueError, httpx.HTTPError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
        )
