from fastapi import APIRouter, HTTPException, Request

traceRouter = APIRouter()

@traceRouter.get('/hello')
async def resolve_hello(request: Request):
    return({"hello": "hello world"})

@traceRouter.get('/excep')
async def resolve_excep():
    raise HTTPException(status_code=401, detail= {"Exception":"Raised Exception1"})

@traceRouter.get('/custom')
async def handle_custom(request: Request):
    raise Exception({"Exception":"This is generated from custom"})