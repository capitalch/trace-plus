from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import APIRouter, Depends
from typing import Annotated
from pydantic import BaseModel
from .security_router_helper import login_helper

securityRouter = APIRouter()


@securityRouter.post("/login", summary='Creates access token')
async def do_login(bundle=Depends(login_helper)):
    return (bundle)
