from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import traceRouter
from dependencies import handle_exception_middleware, handle_http_exception

app = FastAPI()
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

app.add_exception_handler(HTTPException, handle_http_exception)
app.include_router(traceRouter)
app.middleware('http')(handle_exception_middleware)

# @app.middleware("http")
# async def handle_exception_middleware(request: Request, call_next):
#     try:
#         return await call_next(request)
#     except Exception as e:
#         mess = "Error response"
#         return JSONResponse(
#             status_code=500,
#             content={"message": "This is error response from middleware"},
#         )
