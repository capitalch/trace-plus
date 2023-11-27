from app.vendors import CORSMiddleware, FastAPI, HTTPException, JSONResponse, status
from app.dependencies import AppHttpException, app_http_exception_handler, catch_exceptions_middleware, raise_exception
from app.messages import Messages
from app.security import securityRouter

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

app.middleware("http")(catch_exceptions_middleware)

# Add custom exception handler to app
app.add_exception_handler(AppHttpException, app_http_exception_handler)
app.include_router(securityRouter)


@app.get("/api")
async def get_api():
    # x = 1/0
    # await raise_exception()
    # raise HTTPException(status_code=401, detail='abcd')
    return {"api": "trace-plus server"}


@app.exception_handler(404)
async def custom_404_handler(_, __):
    return (JSONResponse(status_code=404, content={'error_code': 'e1001', 'message': Messages.err_url_not_found}))
