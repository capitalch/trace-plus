from pydantic import BaseModel
from typing import Optional

class LineItem(BaseModel):
    product_id: int
    qty: int
    sku: str
    
class Invoice(BaseModel):
    id: int
    ref_no:str
    user_ref_no:str
    remarks: str = None
    line_items: list[LineItem] = None

class AppHttpException(Exception):
    def __init__(self, detail: str, error_code: str = 'unknown', status_code: int = 500):
        self.detail = detail
        self.statusCode = status_code
        self.errorCode = error_code
    detail: str
    statusCode: str
    errorCode: str