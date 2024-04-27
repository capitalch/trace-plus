from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.routers.router import security_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(HTTPException)
async def handle_http_exception(request, exc):
    return JSONResponse(status_code=exc.status_code, content={"message": exc.detail})

async def handle_exceptions(request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": e.args[0]})

app.middleware('http')(
    handle_exceptions
)


app.include_router(security_router)
@app.exception_handler(Exception)
async def exception_handler(request, exc):
    return JSONResponse(content={"message":"test message"})
    return JSONResponse(status_code=200, content={"message": "test"})
    # return {"test": "test"}
    # return JSONResponse(status_code=500, content={"message": "Internal Server Error"})


