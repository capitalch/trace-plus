# from app.vendors import CORSMiddleware, FastAPI, JSONResponse
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.dependencies import AppHttpException, app_http_exception_handler, exceptions_middleware
from app.messages import Messages
from app.security.security_router import securityRouter
from app.graphql.graphql_router import GraphQLApp

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(exceptions_middleware) # Uncatched exceptions will come here

# Add custom exception handler to app. If you raise an exception of type AppHttpException, it will come here
app.add_exception_handler(AppHttpException, app_http_exception_handler)
@app.route("/graphql/", methods=["POST","GET"])
async def graphql(request:Request):
    return await GraphQLApp.handle_request(request)

@app.get("/api")
async def get_api():
    return {"api": "trace-plus server"}


@app.exception_handler(404) # This is a custom exception handler for 404 error when endpoint is not found
async def custom_404_handler(_, __):
    return (JSONResponse(status_code=404, content={'error_code': 'e1001', 'message': Messages.err_url_not_found}))


# app.mount('/graphql/', GraphQLApp)
# app.include_router(securityRouter)
# app.add_route('/graphql/', GraphQLApp)