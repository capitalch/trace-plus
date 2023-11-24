from fastapi.security import OAuth2PasswordBearer
from fastapi import APIRouter, Depends
from typing import Annotated

securityRouter = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@securityRouter.get("/login")
async def do_login(token=Annotated[str, Depends(oauth2_scheme)]):
    return {"token": token}
