from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import APIRouter, Depends
from typing import Annotated
from pydantic import BaseModel
from app.security.security_helper import login_helper
from app.dependencies import AppHttpException

securityRouter = APIRouter()

@securityRouter.get("/api")
async def get_api():
    return {"api": "trace-plus server"}

@securityRouter.post("/login", summary="Creates access token")
async def do_login(bundle=Depends(login_helper)):
    return bundle


@securityRouter.get("/test")
async def resolve_test():
    raise AppHttpException(
        error_code="e1000",
        message="This is a test exception",
        status_code=401,
        detail="This is a test detail",
    )


@securityRouter.post("/test")
async def resolve_test():
    raise AppHttpException(
        error_code="e1020",
        message="This is a test exception",
        status_code=401,
        detail="This is a test detail",
    )
