from psycopg2.pool import ThreadedConnectionPool
from psycopg2.extras import RealDictCursor
from fastapi.encoders import jsonable_encoder
import psycopg2
from app.config import Config

poolStore = {}
dbParams: dict[str, str] = {
    'host': Config.DB_HOST,
    'password': Config.DB_PASSWORD,
    'port': Config.DB_PORT,
    'user': Config.DB_USER,
}


def get_connection_pool(connInfo: str, dbName: str,) -> ThreadedConnectionPool:
    global poolStore
    pool = poolStore.get(dbName)
    if pool is None:
        pool = ThreadedConnectionPool(5, 500, **connInfo)
        poolStore[dbName] = pool
    return (poolStore[dbName])


def get_conn_info(dbName: str = Config.DB_SECURITY_DATABASE, db_params: dict[str, str] = dbParams) -> str:
    if(db_params is None):
        db_params = dbParams
    db_params.update({'dbname': dbName})
    # db_params['dbname'] = dbName
    return (db_params)


def exec_sql(
        dbName: str = Config.DB_SECURITY_DATABASE,
        db_params: dict[str, str] = dbParams,
        schema: str = 'public',
        sql: str = None,
        sqlArgs: dict[str, str] = {}, ):
    connInfo = get_conn_info(dbName, db_params)
    # pool: ThreadedConnectionPool = get_connection_pool(connInfo, dbName)
    records = []
    # with pool.getconn() as conn:
    #     with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # cursor.execute(f'set search_path to {schema}; {sql}', sqlArgs)
            # if (cursor.rowcount > 0):
            #     records = cursor.fetchall()
    #         cursor.close()
    #     # conn.close()
    with psycopg2.connect(**connInfo) as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            print('0')
            cursor.execute(f'set search_path to {schema}; {sql}', sqlArgs)
            print('1')
            if (cursor.rowcount > 0):
                records = cursor.fetchall()
    # return (jsonable_encoder(records))
    return(records)

