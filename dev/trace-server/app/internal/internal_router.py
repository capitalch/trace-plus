import logging
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from app.config import Config
from app.graphql.graphql_helper import accounts_posting_helper

router = APIRouter(prefix="/api/internal", tags=["internal"])


def _verify_service_key(x_service_key: str = Header(..., alias="X-Service-Key")):
    if x_service_key != Config.SERVICE_PLUS_API_KEY:
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
