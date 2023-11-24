from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer
from typing import Union, Any, Annotated

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.get("/login")
async def do_login(token=Annotated[str, Depends(oauth2_scheme)]):
    return {"token": token}