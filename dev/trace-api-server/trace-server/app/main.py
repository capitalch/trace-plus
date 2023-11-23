from app.vendors import CORSMiddleware, FastAPI, HTTPException
from app.dependencies import catch_exceptions_middleware, raise_exception

app = FastAPI()

app.middleware("http")(catch_exceptions_middleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api")
async def get_api():
    # x = 1/0
    # await raise_exception()
    # raise HTTPException(status_code=401, detail='abcd')
    return {"api": "trace-plus server"}
