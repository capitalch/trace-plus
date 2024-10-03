from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse

async def handle_exception_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        mess = 'Error response'
        return JSONResponse(status_code=401,content={"message":"This is error response from middleware"})
    
async def handle_http_exception(request, exc: HTTPException):
    return(JSONResponse(status_code=exc.status_code, content=exc.detail))