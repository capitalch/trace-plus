from app.graphql.db.sql_main import SqlMain
from app.graphql.db.sql_security import SqlSecurity
from app.config import Config
from cryptography.fernet import Fernet

def encrypt(input: str):
    key = Config.CRYPTO_KEY
    cipher_suite = Fernet(key)
    # encode converts string to bytes, decode does opposite
    encoded_text = cipher_suite.encrypt(input.encode('utf-8'))
    return (encoded_text.decode())

def getSqlQueryObject(dbName: str):
    queryObject = SqlMain
    if (dbName == 'traceAuth'):
        queryObject = SqlSecurity
    return (queryObject)

