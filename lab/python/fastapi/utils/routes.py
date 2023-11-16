from fastapi import APIRouter
from .classes import Invoice

router = APIRouter()
jInvoice = {
    'id': 1,
    'ref_no':'abc',
    'user_ref_no':'def'#,
    # 'remarks':'abcdef',
    # 'line_items': None
    # 'line_items':[
    #     {
    #         'product_id': 2,
    #         'qty': 10,
    #         'sku': 'Makhana',
    #     }
    # ]
}

@router.get('/test/router')
def test_router():
    return({'test':'successfull'})

@router.get('/invoice')
def get_invoice() ->Invoice:
    return(jInvoice)