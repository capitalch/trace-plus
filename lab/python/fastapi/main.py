from typing import Union, Any
from fastapi import FastAPI, Body, Request, Header, status, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from utils import router, LineItem, AppHttpException

class Item(BaseModel):
    name:str = 'abc'
    price: float
    is_offer: bool = True

app = FastAPI()
app.include_router(router)

async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception:
        # you probably want some kind of logging here
        
        return (JSONResponse(status_code=502, content='abcd'))

app.middleware('http')(catch_exceptions_middleware)

@app.get('/')
def read_root():
    x = 1/0
    raise AppHttpException(detail='abcd', status_code=401)
    return('Hello world')

@app.get('/query')
def get_query(q:str):
    return({'q':q})

@app.get('/items/{item_id}')
def read_item(item_id: int, q: str = None):
    return({'item_id': item_id, 'q': q})

@app.put('/items/{item_id}')
def update_item(item_id: int, item: Item):
    return({'item_id': item_id, 'name': item.name, 'price': item.price})

@app.post('/lineitem')
async def post_product(lineItem:LineItem):
    # return {'product_id': product_id}
    # body = await request.body()
    data = jsonable_encoder(lineItem)
    return(data)
    # return({'product_id': lineItem.product_id, 'qty': lineItem.qty, 'sku': lineItem.sku})
    
@app.post('/item',)
async def post_item(item:Item):
    return(item)

@app.get('/user', status_code=status.HTTP_200_OK)
def user_agent(user_agent = Header(None)):
    return(user_agent)

@app.get('/check-error')
def check_error():
    raise HTTPException(status_code=506, detail='item not found')

# @app.exception_handler(Exception)
# async def custom_exception_handler(request, ex: Exception):
#     return(JSONResponse(status_code=200, content='abcd'))
#     return(JSONResponse(status_code=500, content={'detail': 'custom message'}))