from fastapi.encoders import jsonable_encoder
from psycopg import OperationalError, AsyncConnection
from psycopg.conninfo import make_conninfo
from psycopg.rows import dict_row
from app.config import Config
from typing import Any

dbParams: dict = {
    "user": Config.DB_USER,
    "password": Config.DB_PASSWORD,
    "port": Config.DB_PORT,
    "host": Config.DB_HOST,
}

def get_conn_info(
    dbName: str = Config.DB_SECURITY_DATABASE, db_params: dict[str, str] = dbParams
) -> str:
    dbName = Config.DB_SECURITY_DATABASE if dbName is None else dbName
    db_params = dbParams if db_params is None else db_params
    db_params.update({"dbname": dbName})
    connInfo = make_conninfo("", **db_params)
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


async def doProcess(
    connInfo, schema, dbName, sql, sqlArgs
):  # Implementation without AsyncConnectionPool
    records = []
    try:
        async with await AsyncConnection.connect(connInfo) as aconn:
            await aconn.execute(f"set search_path to {schema or 'public'}")
            async with aconn.cursor(row_factory=dict_row) as acur:
                await acur.execute(sql, sqlArgs)
                if acur.rowcount > 0:
                    records = await acur.fetchall()
            await acur.close()
            await aconn.commit()
            await aconn.close()
    except OperationalError as e:
        raise e
    except Exception as e:
        raise e
    return records

# Data manipulation language sql. No return value. Not inside a transaction
async def execute_sql_dml(dbName: str = Config.DB_SECURITY_DATABASE, db_params: dict[str, str] = dbParams, schema: str = 'public', sql: str = '', sqlArgs: dict[str, str] = {}):
    connInfo = get_conn_info(dbName, db_params)
    try:
        async with await AsyncConnection.connect(connInfo) as aconn:
            await aconn.execute(f"set search_path to {schema or 'public'}")
            await aconn.execute(sql,sqlArgs)
            await aconn.close()
    except OperationalError as e:
        raise e
    except Exception as e:
        raise e
    
async def process_details(sqlObject: Any, acur: Any, fkeyValue=None):
    ret = None
    if ('deletedIds' in sqlObject):
        await process_deleted_ids(sqlObject, acur)
    xData = sqlObject.get('xData', None)
    tableName = sqlObject.get('tableName', None)
    fkeyName = sqlObject.get('fkeyName', None)
    if (xData):
        if (type(xData) is list):
            for item in xData:
                ret = await process_data(item, acur, tableName,
                                         fkeyName, fkeyValue)
        else:
            ret = await process_data(xData, acur, tableName, fkeyName, fkeyValue)
    return (ret)

async def exec_sql_object(dbName: str = Config.DB_SECURITY_DATABASE, db_params: dict[str, str] = dbParams, schema: str = 'public',  execSqlObject: Any = process_details, sqlObject: Any = None):
    connInfo = get_conn_info(dbName, db_params)
    schema = 'public' if schema is None else schema
    records = None
    try:
        async with await AsyncConnection.connect(connInfo) as aconn:
            await aconn.execute(f"set search_path to {schema or 'public'}")
            async with aconn.cursor(row_factory=dict_row) as acur:
                records = await execSqlObject(sqlObject, acur)
            await acur.close()
            await aconn.commit()
            await aconn.close()
    except OperationalError as e:
        raise e
    except Exception as e:
        raise e
    return records  
    
async def process_data(xData, acur, tableName, fkeyName, fkeyValue):
    xDetails = None
    id = None
    records = None
    if ('xDetails' in xData):
        xDetails = xData.pop('xDetails')
    sql, tup = get_sql(xData, tableName, fkeyName, fkeyValue)
    if (sql):
        await acur.execute(sql, tup)
        if (acur.rowcount > 0):
            records = await acur.fetchone()
            id = records.get('id')
    if (xDetails):
        for item in xDetails:
            await process_details(item, acur, id)
    return (id)


def get_sql(xData, tableName, fkeyName, fkeyValue):
    sql = None
    valuesTuple = None
    if (xData.get('id', None)):  # update
        sql, valuesTuple = get_update_sql(xData, tableName)
    else:  # insert
        sql, valuesTuple = get_insert_sql(
            xData, tableName, fkeyName, fkeyValue)
    return (sql, valuesTuple)


def get_insert_sql(xData, tableName, fkeyName, fkeyValue):
    fieldNamesList = list(xData.keys())
    if (fkeyName and fkeyValue):
        fieldNamesList.append(fkeyName)
    fieldsCount = len(fieldNamesList)

    for idx, name in enumerate(fieldNamesList):
        fieldNamesList[idx] = f''' "{name}" '''  # surround fields with ""
    fieldsString = ','.join(
        fieldNamesList)  # f'''({','.join( fieldNamesList   )})'''

    placeholderList = ['%s'] * fieldsCount
    placeholdersForValues = ', '.join(placeholderList)

    valuesList = list(xData.values())
    if fkeyName and fkeyValue:
        valuesList.append(fkeyValue)
    valuesTuple = tuple(valuesList)
    sql = f'''insert into "{tableName}"
        ({fieldsString}) values({placeholdersForValues}) returning id
        '''
    return (sql, valuesTuple)


def get_update_sql(xData, tableName):
    def getUpdateKeyValuesString(dataCopy):
        dataCopy.pop('id')
        lst = []
        for item in dataCopy:
            lst.append(f''' "{item}" = %s''')
        keyValueStr = ', '.join(lst)
        valuesTuple = tuple(dataCopy.values())
        return (keyValueStr, valuesTuple)

    keyValueStr, valuesTuple = getUpdateKeyValuesString(xData.copy())
    sql = f'''
        update "{tableName}" set {keyValueStr}
            where id = {xData['id']} returning "{"id"}"
    '''
    return (sql, valuesTuple)


async def process_deleted_ids(sqlObject, acur: Any):
    deletedIdList = sqlObject.get('deletedIds')
    tableName = sqlObject.get('tableName')
    ret = '('
    for x in deletedIdList:
        ret = ret + str(x) + ','
    ret = ret.rstrip(',') + ')'
    sql = f'''delete from "{tableName}" where id in{ret}'''
    await acur.execute(sql)
    
    
    
# from psycopg_pool import AsyncConnectionPool
# poolStore = {}
# from app.dependencies import AppHttpException

# from fastapi import status
# connInfo = f'''
#     host = {Config.DB_HOST} password = {Config.DB_PASSWORD} port = {Config.DB_PORT} user = {Config.DB_USER} dbname = {dbName}
# '''

# pool store not being used
# async def disconnect_pool_store():
#     global poolStore
#     for pool in poolStore.values():
#         await pool.close()
#     poolStore = {}

# connection pool not being used
# def get_connection_pool(
#     connInfo: str,
#     dbName: str,
# ) -> AsyncConnectionPool:
#     global poolStore
#     pool: AsyncConnectionPool = poolStore.get(dbName)
#     if (pool is None) or (pool.closed):
#         poolStore[dbName] = AsyncConnectionPool(
#             conninfo=connInfo, timeout=3, reconnect_timeout=2,open=False)
#     return poolStore[dbName]

# async def doProcess1(connInfo, schema, dbName, sql, sqlArgs): # Implementation with AsyncConnectionPool. I discarded iit because it uses 3 extra connections
#     apool: AsyncConnectionPool = get_connection_pool(
#         connInfo,
#         dbName,
#     )
#     records = []
#     try:
#         async with apool:
#             async with apool.connection() as aconn:
#                 await aconn.execute(f"set search_path to {schema or 'public'}")
#                 async with aconn.cursor(row_factory=dict_row) as acur:
#                     await acur.execute(sql, sqlArgs)
#                     if acur.rowcount > 0:
#                         records = await acur.fetchall()
#                 await acur.close()
#                 await aconn.commit()
#     except OperationalError as e:
#         raise e
#     except Exception as e:
#         raise e
#     return (records)
