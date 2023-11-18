from app.vendors import CORSMiddleware, FastAPI

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
                   'http://127.0.0.1:3000', "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/api')
async def get_api():
    return({'api':  'trace-plus'})