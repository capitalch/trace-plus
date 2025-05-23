from fastapi.encoders import jsonable_encoder
from fastapi import status
from asyncpg import create_pool, Pool
from app.core.dependencies import AppHttpException
from app.config import Config
from typing import Any

poolStore = {}

dbParams: dict = {
    'user': Config.DB_USER,
    'password': Config.DB_PASSWORD,
    'port': Config.DB_PORT,
    'host': Config.DB_HOST,
}

async def get_connection_pool(connInfo: any, dbName: str):
    pool = poolStore.get(dbName)
    if pool is None:
        pool = await create_pool(**connInfo)
        poolStore[dbName] = pool
    return(pool)

async def exec_sql(dbName: str = Config.DB_SECURITY_DATABASE,
    db_params: dict[str, str] = dbParams,
    schema: str = "public",
    sql: str = None,
    sqlArgs: dict[str, str] = {},):
    
    db_params.update({'database': dbName})
    try:
        pool: Pool = await get_connection_pool(db_params, dbName)
        records = None
        sql1, valuesTuple = to_native_sql(sql, sqlArgs)
    except Exception as e:
        # print(e)
        raise AppHttpException(error_code='e1005', message=str(e),status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    # async with create_pool(**db_params) as pool:
    # async with get_connection_pool(db_params, dbName) as pool:
    try:
        async with pool.acquire() as conn:
            async with conn.transaction():
                await conn.execute(f'set search_path to {schema}')
                records = await conn.fetch(sql1, *valuesTuple)
                # records = await conn.fetch(f'set search_path to {schema}; {sql1}', *valuesTuple)
            # await conn.close()
    except Exception as e:
        raise AppHttpException(error_code='e1006', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, message=str(e))
    
    # return(records)
    return(jsonable_encoder(records))
    

def to_native_sql(sql: str, params: dict):
    cnt = 0
    paramsTuple = ()

    def getNewParamName():
        nonlocal cnt
        cnt = cnt + 1
        return (f'${cnt}')

    for prop in params:
        sprop = f'%({prop})s'
        sql = sql.replace(sprop, getNewParamName())
        paramsTuple = paramsTuple + (params[prop],)

    return (sql, paramsTuple)