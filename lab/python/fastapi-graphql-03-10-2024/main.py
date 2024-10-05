from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import traceRouter
from dependencies import (
    handle_exception_middleware,
    handle_http_exception,
    AppHttpException,
    handle_app_http_exception,
    verify_token,
)
from app_graphql.graphql__routers import GraphQLApp

app = FastAPI()
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

app.add_exception_handler(HTTPException, handle_http_exception)
app.add_exception_handler(AppHttpException, handle_app_http_exception)
app.include_router(traceRouter)
app.middleware("http")(handle_exception_middleware)


# app.mount("/graphql/", GraphQLApp)
@app.post("/graphql/")
async def graphql(request: Request):
    return JSONResponse(status_code=404, content={"message":"Special message"})
    # raise AppHttpException(
    #     error_code="e1002",
    #     message="GraphQL error",
    #     status_code=403,
    #     detail={"specifics": "Detailed message"},
    # )
    # mess = 'ABCD'
    # return { # it does not work
    #         "error": {
    #             "content": {
    #                 "error_code": "e2000",
    #                 "message": "Graphql error occured",
    #                 "status_code": "400",
    #                 "detail": mess,
    #             }
    #         }
    #     }
    # raise HTTPException(status_code=403, detail={"message": "This is error response from middleware"})
    # return JSONResponse(
    #         status_code=403,
    #         content={"message": "This is error response from middleware"},
    #     )
    # return await GraphQLApp.handle_request(request)
