from typing import Union, Any
from fastapi import FastAPI, Body, Request, Header, status, HTTPException, Depends
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from utils import router, LineItem, AppHttpException, securityRouter
from utils.graphql import GraphQLApp

class Item(BaseModel):
    name: str = "abc"
    price: float
    is_offer: bool = True


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # "http://localhost:3000",
        # "http://127.0.0.1:3000",
        # "http://localhost:3001",
        # "http://127.0.0.1:3001",
        '*'
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.include_router(router)
app.include_router(securityRouter)


async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as ex:
        # you probably want some kind of logging here
        mess = "abcd"
        if ex.args[0]:
            mess = ex.args[0]
        return JSONResponse(status_code=500, content=mess)


app.middleware("http")(catch_exceptions_middleware)

app.add_route('/graphql/', GraphQLApp)

@app.get("/")
def read_root():
    # raise AppHttpException(detail="abcd", status_code=401)
    return "Hello world"


# @app.get("/query")
# def get_query(q: str):
#     return {"q": q}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}


@app.put("/items/{item_id}")
def update_item(item_id: int, item: Item):
    return {"item_id": item_id, "name": item.name, "price": item.price}


@app.post("/lineitem")
async def post_product(lineItem: LineItem):
    # return {'product_id': product_id}
    # body = await request.body()
    data = jsonable_encoder(lineItem)
    return data
    # return({'product_id': lineItem.product_id, 'qty': lineItem.qty, 'sku': lineItem.sku})


@app.post(
    "/item",
)
async def post_item(item: Item):
    return item


@app.get("/user", status_code=status.HTTP_200_OK)
def user_agent(user_agent=Header()):
    return user_agent


@app.get("/check-error")
def check_error():
    raise HTTPException(status_code=506, detail="item not found")


@app.get("/check-dependency1")
def check_dependency(id: str = 1, name: str = "sushant"):
    return {"id": id, "name": name}


def my_dependency(id: str = 1, name: str = "sushant"):
    return {"id": id, "name": name}


@app.get("/check-dependency")
def check_dependency(ret=Depends(my_dependency)):
    return ret
