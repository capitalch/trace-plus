from app.vendors import HTTPException, JSONResponse, Request, status
from app.messages import Messages


async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as ex:
        # you probably want some kind of logging here
        mess = Messages.err_internal_server_error
        statusCode = status.HTTP_500_INTERNAL_SERVER_ERROR
        if ex.args[0]:
            mess = ex.args[0]
            statusCode = 512
        return JSONResponse(status_code=statusCode, content={'detail':mess})

async def raise_exception(status_code: int = 452, detail:str = Messages.err_unknown):
    # Provide logging here
    raise HTTPException(status_code=status_code, detail=detail)
