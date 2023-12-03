from app.vendors import Any, HTTPException, JSONResponse, Request, status
from app.messages import Messages

class AppHttpException(HTTPException):
    def __init__(self, error_code: str, message: str, status_code: int= 404):
        self.error_code = error_code
        self.message = message
        self.status_code = status_code

async def app_http_exception_handler(request: Request, exc: AppHttpException):
    return (JSONResponse(status_code=exc.status_code, content={'error_code': exc.error_code, 'message': exc.message}))


async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as ex:
        # you probably want some kind of logging here
        mess = Messages.err_internal_server_error
        statusCode = status.HTTP_500_INTERNAL_SERVER_ERROR
        if len(ex.args) > 0:
            mess = ex.args[0]
            # statusCode = 500
        return JSONResponse(status_code=statusCode, content={
            'error_code': 'e1000',
            'message': mess})

class UserClass:
    def __init__(self,
                 userType, businessUnits=None, clientCode=None, clientId=None, clientName=None, dbName=None, dbParams=None,  email=None, isClientActive=False, isUserActive=False, isExternalDb=False, lastUsedBuId=None, lastUsedBranchId=None, mobileNo=None, userName=None, id=None, fullName=None, role=None,
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
        self.userType = userType
        self.userName = userName
        self.fullName = fullName
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
    userName: str
    id: int
    fullName: str
    userType: str


# async def raise_exception(status_code: int = 452, detail: str = Messages.err_unknown):
#     # Provide logging here
#     raise HTTPException(status_code=status_code, detail=detail, )
