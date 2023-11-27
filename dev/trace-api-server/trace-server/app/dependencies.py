from app.vendors import HTTPException, JSONResponse, Request, status
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


async def raise_exception(status_code: int = 452, detail: str = Messages.err_unknown):
    # Provide logging here
    raise HTTPException(status_code=status_code, detail=detail, )
