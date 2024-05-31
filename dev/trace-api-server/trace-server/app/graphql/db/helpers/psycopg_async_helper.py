from fastapi.encoders import jsonable_encoder
from fastapi import status
from psycopg import OperationalError
from psycopg_pool import AsyncConnectionPool
from psycopg.conninfo import make_conninfo
from psycopg.rows import dict_row
from app.dependencies import AppHttpException

from app.config import Config

poolStore = {}
dbParams: dict = {
    "user": Config.DB_USER,
    "password": Config.DB_PASSWORD,
    "port": Config.DB_PORT,
    "host": Config.DB_HOST,
}


def get_connection_pool(
    connInfo: str,
    dbName: str,
) -> AsyncConnectionPool:
    global poolStore
    pool: AsyncConnectionPool = poolStore.get(dbName)
    if (pool is None) or (pool.closed):
        poolStore[dbName] = AsyncConnectionPool(
            conninfo=connInfo, timeout=3, reconnect_timeout=2,)
    return poolStore[dbName]


def get_conn_info(
    dbName: str = Config.DB_SECURITY_DATABASE, db_params: dict[str, str] = dbParams
) -> str:
    dbName = Config.DB_SECURITY_DATABASE if dbName is None else dbName
    db_params = dbParams if db_params is None else db_params
    db_params.update({'dbname': dbName})
    connInfo = make_conninfo("", **db_params)
    # connInfo = f'''
    #     host = {Config.DB_HOST} password = {Config.DB_PASSWORD} port = {Config.DB_PORT} user = {Config.DB_USER} dbname = {dbName}
    # '''
    return connInfo


async def exec_sql(
    request,
    dbName: str = Config.DB_SECURITY_DATABASE,
    db_params: dict[str, str] = dbParams,
    schema: str = "public",
    sql: str = None,
    sqlArgs: dict[str, str] = {},
):
    connInfo = get_conn_info(dbName, db_params)
    records = []
    records = await doProcess(connInfo, schema, dbName, sql, sqlArgs)
    return jsonable_encoder(records)


async def doProcess(connInfo, schema, dbName, sql, sqlArgs):
    apool: AsyncConnectionPool = get_connection_pool(
        connInfo,
        dbName,
    )
    records = []
    try:
        async with apool.connection() as aconn:
            await aconn.execute(f"set search_path to {schema or 'public'}")
            
            async with aconn.cursor(row_factory=dict_row) as acur:
                await acur.execute(sql, sqlArgs)
                if acur.rowcount > 0:
                    records = await acur.fetchall()
            await acur.close()
            await aconn.commit()
    except OperationalError as e:
        raise e
    # try:
    #     async with aconn.cursor(row_factory=dict_row) as acur:
    #         await acur.execute(sql, sqlArgs)
    #         if acur.rowcount > 0:
    #             records = await acur.fetchall()
    #     await acur.close()
    #     await aconn.commit()
    except Exception as e:
        raise e
    return (records)
