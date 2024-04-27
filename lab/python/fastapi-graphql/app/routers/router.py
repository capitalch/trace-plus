from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from typing import Union, Any, Annotated

security_router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@security_router.get("/login")
async def do_login(token=Annotated[str, Depends(oauth2_scheme)]):
    return {"token": token}

@security_router.get('/test')
async def do_test():
    raise HTTPException(status_code=400, detail="An error occurred as HTTPException")
    # raise ValueError("An error occurred1")
    # return {"test": "test"}