from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi import APIRouter, Depends
from typing import Annotated
from pydantic import BaseModel


securityRouter = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@securityRouter.post("/login")
async def do_login(formData=Depends( OAuth2PasswordRequestForm)):
    username = formData.username.strip()
    password = formData.password.strip()
    return {"accessToken": "abc", "refreshToken": "gfd"}
    # return('Abcd')
