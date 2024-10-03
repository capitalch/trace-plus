from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import traceRouter
from dependencies import handle_exception_middleware, handle_http_exception, AppHttpException, handle_app_http_exception
from app_graphql.graphql__routers import GraphQLApp
from ariadne.explorer import ExplorerGraphiQL

app = FastAPI()
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

app.add_exception_handler(HTTPException, handle_http_exception)
app.add_exception_handler(AppHttpException, handle_app_http_exception)
app.include_router(traceRouter)
app.middleware('http')(handle_exception_middleware)
app.mount("/graphql/", GraphQLApp)