from fastapi import APIRouter, HTTPException, Request
from dependencies import AppHttpException

traceRouter = APIRouter()

@traceRouter.get("/hello")
async def resolve_hello(request: Request):
    return {"hello": "hello world"}

@traceRouter.get("/excep")
async def resolve_excep():
    raise HTTPException(status_code=401, detail={"Exception": "Raised Exception1"})

@traceRouter.get("/custom")
async def handle_custom(request: Request):
    raise Exception({"Exception": "This is generated from custom"})

@traceRouter.get("/appexcep")
async def handle_appexcep(request: Request):
    raise AppHttpException(
        error_code=403, detail="App http exception raised", message="ABCD"
    )
