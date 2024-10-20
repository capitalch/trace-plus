from fastapi import HTTPException, status, Request


# Placement of class before the imports resolve circular import problem
class AppHttpException(HTTPException):
    def __init__(
        self, error_code: str, message: str, status_code: int = 404, detail: str = ""
    ):
        self.error_code = error_code
        self.message = message
        self.status_code = status_code
        self.detail = detail  # detail is must


from typing import Any
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from app.messages import Messages
from app.security.security_utils import validate_token
from datetime import datetime
import logging


async def app_http_exception_handler(request: Request, exc: AppHttpException):
    logging.error(exc.message)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_code": exc.error_code,
            "message": exc.message,
            "detail": exc.detail,
        },
    )


def configure_logger():
    # Logging levels are Debug:10, Info: 20, Warning: 30, Error: 40, Critical: 50
    currentMonth = datetime.now().strftime("%b")
    currentYear = datetime.now().year
    logFormatStr = "%(asctime)s  %(levelname)s - %(message)s"
    logging.basicConfig(
        filename=f"logs/{currentMonth}-{currentYear}.log",
        force=True,
        level=logging.INFO,
        format=logFormatStr,
    )


async def exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as ex:
        # you probably want some kind of logging here
        mess = Messages.err_internal_server_error
        statusCode = status.HTTP_500_INTERNAL_SERVER_ERROR
        if len(ex.args) > 0:
            mess = ex.args[0]
        logging.error(mess)
        return JSONResponse(
            status_code=statusCode,
            content={
                "error_code": "e1000",
                "detail": "An uncaught error occurred at server",
                "message": mess,
            },
        )

class UserClass:
    def __init__(
        self,
        userType,
        businessUnits=None,
        clientCode=None,
        clientId=None,
        clientName=None,
        dbName=None,
        dbParams=None,
        email=None,
        isClientActive=False,
        isUserActive=False,
        isExternalDb=False,
        lastUsedBuId=None,
        lastUsedBranchId=None,
        mobileNo=None,
        uid=None,
        id=None,
        userName=None,
        role=None,
        roleId=None
    ):

        self.businessUnits = businessUnits
        self.clientCode = clientCode
        self.clientName = clientName
        self.clientId = clientId
        self.dbName = dbName
        self.dbParams = dbParams
        self.email = email
        self.isClientActive = isClientActive
        self.isUserActive = isUserActive
        self.isExternalDb = isExternalDb
        self.lastUsedBranchId = lastUsedBranchId
        self.lastUsedBuId = lastUsedBuId
        self.mobileNo = mobileNo
        self.role = role
        self.roleId = roleId
        self.userType = userType
        self.uid = uid
        self.userName = userName
        self.id = id

    businessUnits: Any
    clientCode: str
    clientName: str
    clientId: int
    dbName: str
    dbParams: dict
    email: str
    isExternalDb: bool
    isUserActive: bool
    isUserActive: bool
    lastUsedBranchId: int
    lastUsedBuId: int
    mobileNo: str
    role: dict
    roleId: int
    uid: str
    id: int
    userName: str
    userType: str
