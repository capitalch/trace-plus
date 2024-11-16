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


# These classes ar AI generated
class BusinessUnit:
    def __init__(self, buCode: str, buId: int, buName: str):
        self.buCode = buCode
        self.buId = buId
        self.buName = buName


class Role:
    def __init__(self, clientId: int, roleId: int, roleName: str):
        self.clientId = clientId
        self.roleId = roleId
        self.roleName = roleName


class SecuredControl:
    def __init__(
        self,
        controlName: str,
        controlNo: int,
        controlType: str,
        descr: str,
        id: int,
    ):
        self.controlName = controlName
        self.controlNo = controlNo
        self.controlType = controlType
        self.descr = descr
        self.id = id


class UserDetails:
    def __init__(
        self,
        branchIds: str,
        clientCode: str,
        clientId: int,
        clientName: str,
        dbName: str,
        dbParams: dict[str, str | int],
        hash: str,
        id: int,
        isUserActive: bool,
        isClientActive: bool,
        isExternalDb: bool,
        lastUsedBranchId: int,
        lastUsedBuId: int,
        mobileNo: str,
        roleId: int,
        uid: str,
        userEmail: str,
        userName: str,
        userType: str,
    ):
        self.branchIds = branchIds
        self.clientCode = clientCode
        self.clientId = clientId
        self.clientName = clientName
        self.dbName = dbName
        self.dbParams = dbParams
        self.hash = hash
        self.id = id
        self.isUserActive = isUserActive
        self.isClientActive = isClientActive
        self.isExternalDb = isExternalDb
        self.lastUsedBranchId = lastUsedBranchId
        self.lastUsedBuId = lastUsedBuId
        self.mobileNo = mobileNo
        self.roleId = roleId
        self.uid = uid
        self.userEmail = userEmail
        self.userName = userName
        self.userType = userType


class UserClass:
    def __init__(
        self,
        allBusinessUnits: list[dict[str, int | str]],
        allSecuredControls: list[dict[str, int | str]],
        role: dict[str, int | str],
        userBusinessUnits: list[dict[str, int | str]],
        userDetails: dict[str, int | str | bool | list[int] | dict[str, str | int]],
        userSecuredControls: list[dict[str, int | str]],
    ):
        self.userDetails = UserDetails(**userDetails)
        self.userBusinessUnits = userBusinessUnits # [BusinessUnit(**bu) for bu in userBusinessUnits]
        self.allBusinessUnits = allBusinessUnits # [BusinessUnit(**bu) for bu in allBusinessUnits]
        self.role = Role(**role)
        self.allSecuredControls = allSecuredControls # [
            #SecuredControl(**ctrl) for ctrl in allSecuredControls
        #]
        self.userSecuredControls = userSecuredControls #[
            #SecuredControl(**ctrl) for ctrl in userSecuredControls
        #]

class SuperAdminUserClass:
    def __init__(self, userDetails:dict[str:str]):
        self.userDetails = {
            "userName": userDetails.get('userName'),
            "userEmail": userDetails.get('userEmail'),
            "mobileNo":userDetails.get('mobileNo'),
            "userType": userDetails.get('userType')
        }

# class UserClass:
#     def __init__(
#         self,
#         businessUnits=None,
#         clientCode=None,
#         clientId=None,
#         clientName=None,
#         dbName=None,
#         dbParams=None,
#         email=None,
#         id=None,
#         isClientActive=False,
#         isExternalDb=False,
#         isUserActive=False,
#         lastUsedBranchId=None,
#         lastUsedBuId=None,
#         mobileNo=None,
#         role=None,
#         roleId=None,
#         uid=None,
#         userName=None,
#         userType=None
#     ):

#         self.businessUnits = businessUnits
#         self.clientCode = clientCode
#         self.clientId = clientId
#         self.clientName = clientName
#         self.dbName = dbName
#         self.dbParams = dbParams
#         self.email = email
#         self.id = id
#         self.isClientActive = isClientActive
#         self.isExternalDb = isExternalDb
#         self.isUserActive = isUserActive
#         self.lastUsedBranchId = lastUsedBranchId
#         self.lastUsedBuId = lastUsedBuId
#         self.mobileNo = mobileNo
#         self.role = role
#         self.roleId = roleId
#         self.uid = uid
#         self.userName = userName
#         self.userType = userType


#     businessUnits: Any
#     clientCode: str
#     clientId: int
#     clientName: str
#     dbName: str
#     dbParams: dict
#     email: str
#     id: int
#     isExternalDb: bool
#     isUserActive: bool
#     lastUsedBranchId: int
#     lastUsedBuId: int
#     mobileNo: str
#     role: dict
#     roleId: int
#     uid: str
#     userName: str
#     userType: str
