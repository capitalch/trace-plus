from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.graphql.db.sql_accounts import SqlAccounts
from app.graphql.db.sql_security import SqlSecurity
from app.config import Config
from cryptography.fernet import Fernet

def is_not_none_or_empty(value):
    ret = True
    if value is None:
        ret = False
    if isinstance(value, (tuple, list, set, dict)) and (len(value) == 0):
        ret = False
    return ret

def decrypt(input: str):
    key = Config.CRYPTO_KEY
    cipher_suite = Fernet(key)
    decoded_text = cipher_suite.decrypt(input.encode())
    return (decoded_text.decode())

def encrypt(input: str):
    key = Config.CRYPTO_KEY
    cipher_suite = Fernet(key)
    # encode converts string to bytes, decode does opposite
    encoded_text = cipher_suite.encrypt(input.encode('utf-8'))
    return (encoded_text.decode())
    
def getSqlQueryObject(dbName: str):
    queryObject = SqlAccounts
    if (dbName == 'traceAuth'):
        queryObject = SqlSecurity
    return (queryObject)

