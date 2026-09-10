import hmac
import logging
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from app.config import settings
from app.graphql.graphql_helper import accounts_posting_helper

router = APIRouter(prefix="/api/internal", tags=["internal"])


def _verify_service_key(x_service_key: str = Header(..., alias="X-Service-Key")):
    # compare_digest, not `!=`: a plain comparison returns as soon as two bytes differ, so
    # response timing leaks how many leading characters of the key were guessed correctly —
    # enough to recover a pre-shared key byte by byte. Compared as bytes because the str
    # form of compare_digest rejects non-ASCII input, which would turn a malformed header
    # into a 500 instead of a clean 401.
    expected = settings.service_plus_api_key.get_secret_value()
    if not hmac.compare_digest(x_service_key.encode("utf-8"), expected.encode("utf-8")):
        raise HTTPException(status_code=401, detail="Invalid service key")


@router.post("/accounts-posting")
async def accounts_posting_internal(request: Request, _: str = Depends(_verify_service_key)):
    body = await request.json()
    logging.info(f"Trace Plus: Accounts posting internal request")
    result = await accounts_posting_helper(None, body.get("value", ""))
    if isinstance(result, dict) and result.get("error"):
        detail = result["error"].get("content", {}).get("detail", "Accounts posting failed")
        raise HTTPException(status_code=400, detail=detail)
    return result
