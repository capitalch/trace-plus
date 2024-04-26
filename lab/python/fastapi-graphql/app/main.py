from fastapi import FastAPI
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
@app.exception_handler(Exception)
async def exception_handler(request, exc):
    return JSONResponse(status_code=200, content={"message": "test"})
    # return {"test": "test"}
    # return JSONResponse(status_code=500, content={"message": "Internal Server Error"})
app.include_router(security_router)

