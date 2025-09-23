from fastapi.security import OAuth2PasswordRequestForm
# from fastapi.responses import JSONResponse
from fastapi import APIRouter, Depends, Request
from app.security.security_utils import validate_token
from app.security.security_helper import (
    forgot_password_helper,
    login_helper,
    login_clients_helper,
    resolve_pincode_helper,
    reset_password_helper,
)
from app.core.dependencies import AppHttpException
from app.core.export_file import exportFile, ValueData
# import json

securityRouter = APIRouter()

@securityRouter.post("/api/export-file")
async def export_file(request: Request, valueData: ValueData):
    await validate_token(request)
    return await exportFile(valueData)


@securityRouter.post("/api/login", summary="Creates access token")
async def do_login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    form = await request.form()
    clientId = form.get("clientId")
    username = form_data.username
    password = form_data.password
    bundle = await login_helper(clientId, username, password)
    return bundle


@securityRouter.get("/api/test")
async def resolve_test():
    raise AppHttpException(
        error_code="e1000",
        message="This is a test exception",
        status_code=401,
        detail="This is a test detail",
    )


@securityRouter.post("/api/login-clients")
async def resolve_login_clients(request: Request):
    return await login_clients_helper(request)

@securityRouter.get("/api/pincode/{pincode}")
async def resolve_pincode(pincode: str):
    return await resolve_pincode_helper(pincode)


@securityRouter.post("/api/forgot-password")
async def resolve_forgot_password(request: Request):
    return await forgot_password_helper(request)


@securityRouter.get("/reset-password/{token}")
async def resolve_reset_password(token: str):
    return await reset_password_helper(token)



# @securityRouter.post("/test")
# async def resolve_test():
#     raise AppHttpException(
#         error_code="e1020",
#         message="This is a test exception",
#         status_code=401,
#         detail="This is a test detail",
#     )

# @securityRouter.get("/countries")
# async def resolve_countries():
#     with open("app/security/test_countries.json") as countries:
#         parsed_countries = json.load(countries)
#         return JSONResponse(content=parsed_countries)