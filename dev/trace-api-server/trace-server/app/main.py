from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.dependencies import (
    AppHttpException,
    app_http_exception_handler,
    configure_logger,
    exceptions_middleware,
    # handle_token_middleware,
)
from app.messages import Messages
from app.security.security_router import securityRouter
from app.graphql.graphql_router import GraphQLApp
from app.security.security_utils import validate_token
import logging

app = FastAPI()
configure_logger()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(securityRouter)
# Uncatched exceptions will come here
app.middleware("http")(exceptions_middleware)
# app.middleware("http")(handle_token_middleware)
# Add custom exception handler to app
# If you raise an exception of type AppHttpException, it will come here
app.add_exception_handler(AppHttpException, app_http_exception_handler)

logging.info("Server started")


@app.route("/graphql/", methods=["POST", "GET"])
async def graphql(request: Request):
    # Handle token verification over here. It does not work in middleware
    # if valid token then proceed
    await validate_token(request)  # Comment this line if authentication is off
    return await GraphQLApp.handle_request(request)


@app.exception_handler(
    404
)  # This is a custom exception handler for 404 error when endpoint is not found
async def custom_404_handler(_, __):
    logging.error(Messages.err_url_not_found)
    return JSONResponse(
        status_code=404,
        content={"error_code": "e1001", "message": Messages.err_url_not_found},
    )
