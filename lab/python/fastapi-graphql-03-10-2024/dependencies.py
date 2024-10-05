from fastapi import Request, HTTPException


class AppHttpException(HTTPException):
    def __init__(
        self, error_code: str, message: str, status_code: int = 404, detail: str = ""
    ):
        self.error_code = error_code
        self.message = message
        self.status_code = status_code
        self.detail = detail  # detail is must


from fastapi.responses import JSONResponse


async def handle_exception_middleware(request: Request, call_next):
    try:
        path = request.url.path
        # if path.find("graphql") != -1:
            # raise HTTPException(status_code=403,detail='Token Error')
            # return JSONResponse(
            #     status_code=401
            # )
        # else:
        return await call_next(request)
    except Exception as e:
        mess = "Error response"
        return JSONResponse(
            status_code=401,
            content={"message": "This is error response from middleware"},
        )


async def handle_http_exception(request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content=exc.detail)


async def handle_app_http_exception(request, exc: AppHttpException):
    return JSONResponse(status_code=exc.status_code, content=exc.detail)

def verify_token(args):
    print(args)
    return(True)