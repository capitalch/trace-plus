from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from fastapi import APIRouter, Depends, Request
import pandas as pd
from pydantic import BaseModel
from fastapi.responses import Response
import io
# from typing import Annotated
# from fastapi.responses import FileResponse
# from pydantic import BaseModel
from app.security.security_helper import (
    forgot_password_helper,
    login_helper,
    login_clients_helper,
    reset_password_helper,
)
from app.core.dependencies import AppHttpException
from app.core.export_file import exportFile, ValueData
import json

securityRouter = APIRouter()


@securityRouter.get("/api")
async def get_api():
    return {"api": "trace-plus server"}


@securityRouter.post("/export-file/")
async def export_file(request: ValueData):
    return await exportFile(request)    


@securityRouter.post("/login", summary="Creates access token")
async def do_login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    form = await request.form()
    clientId = form.get("clientId")
    username = form_data.username
    password = form_data.password
    bundle = await login_helper(clientId, username, password)
    return bundle


@securityRouter.get("/test")
async def resolve_test():
    raise AppHttpException(
        error_code="e1000",
        message="This is a test exception",
        status_code=401,
        detail="This is a test detail",
    )


@securityRouter.get("/countries")
async def resolve_countries():
    with open("app/security/test_countries.json") as countries:
        parsed_countries = json.load(countries)
        return JSONResponse(content=parsed_countries)


@securityRouter.post("/login-clients")
async def resolve_login_clients(request: Request):
    return await login_clients_helper(request)


@securityRouter.post("/test")
async def resolve_test():
    raise AppHttpException(
        error_code="e1020",
        message="This is a test exception",
        status_code=401,
        detail="This is a test detail",
    )


@securityRouter.post("/forgot-password")
async def resolve_forgot_password(request: Request):
    return await forgot_password_helper(request)


@securityRouter.get("/reset-password/{token}")
async def resolve_reset_password(token: str):
    return await reset_password_helper(token)


# @securityRouter.get("/download-excel/")
# async def download_excel(request: ExportFile):
#     # Create an Excel file
#     df = pd.DataFrame({"Name": ["Alice", "Bob"], "Score": [85, 90]})
#     output = io.BytesIO()
#     writer = pd.ExcelWriter(output, engine='xlsxwriter')
#     df.to_excel(writer, sheet_name='xyz', index=False)
#     writer.close()
#     output.seek(0)
#     str = output.read()
#     output.close()
#     return Response(str, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
#                     headers={"Content-Disposition": "attachment; filename=report.xlsx"},)
