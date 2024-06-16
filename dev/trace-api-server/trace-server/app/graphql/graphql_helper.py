import datetime
import json
from fastapi import status, Request
from urllib.parse import unquote
from app.dependencies import AppHttpException
from app.messages import Messages
from .db.sql_security import allSqls
from .db.helpers.psycopg_async_helper import exec_sql

# from .db.sql_security import SqlSecurity
from app.utils import getSqlQueryObject

async def generic_update_helper(info,value: str):
    pass

async def generic_query_helper(info, value: str):
    data = {}
    try:
        valueString = unquote(value)
        valueDict = json.loads(valueString)
        dbParams = valueDict.get("dbParams", None)
        schema = valueDict.get("buCode", None)
        sqlId = valueDict.get("sqlId", None)
        request = info.context.get("request", None)
        requestJson = await request.json()
        operationName = requestJson.get("operationName", None)
        sqlQueryObject = getSqlQueryObject(operationName)
        sql = getattr(sqlQueryObject, sqlId, None)
        sqlArgs = valueDict.get("sqlArgs", {})
        data = await exec_sql(
            request,
            dbName=operationName,
            db_params=dbParams,
            schema=schema,
            sql=sql,
            sqlArgs=sqlArgs,
        )

    except Exception as e:
        # Need to return error as data. Raise error does not work with GraphQL
        # At client check data for error attribut and take action accordingly
        mess = ""
        if (e.args) is not None:
            mess = e.args[0]
        return {
            "error": {
                "content": {
                    "error_code": "e2000",
                    "message": "Graphql error occured",
                    "status_code": "400",
                    "detail": mess,
                }
            }
        }
    return data

async def update_client_helper(info, value: str):
    data = {}
    try:
        valueString = unquote(value)
        request = info.context.get('request', None)
        requestJson = await request.json()
        operationName = requestJson.get('operationName', None)
        sqlObj = json.loads(valueString)
        xData = sqlObj.get('xData', None)
        if(xData):
            isExternalDb: bool = xData.get('isExternalDb', None)
            dbParams = xData.get('dbParams', None)
            if (dbParams):
                pass
                # dbParamsEncrypted = utils.encrypt(dbParams)
                # xData['dbParams'] = dbParamsEncrypted
                # Encrypt dbParams and set in xData
            dbToCreate = xData.get('dbName')
            if(dbToCreate):
                pass
                # dbNameInCatalog: str = await exec_sql(
                #     request,
                #     dbName=operationName,
                #     db_params=dbParams,
                #     schema="public",
                #     sql=SqlSecurity.get_db_name_in_catalog,
                #     sqlArgs={"dbName": dbToCreate},
                # )
    except Exception as e:
        pass
    
    
# async def generic_query_helper1():
#     # sql = 'select * from "TranD" where "id" <> %(id)s'
#     sql = allSqls.get("sql1")
#     sqlArgs = {"id": 1}
#     data = []
#     try:
#         start_time = datetime.now()
#         for i in range(1):
#             data = exec_sql_psycopg2(
#                 dbName="demo_accounts", schema="demounit1", sql=sql, sqlArgs={"id": 1}
#             )
#         end_time = datetime.now()
#         print(f"Duration1: {end_time - start_time}")

#         start_time = datetime.now()
#         for i in range(1):
#             data = await exec_sql_psycopg_async(
#                 dbName="demo_accounts", schema="demounit1", sql=sql, sqlArgs={"id": 1}
#             )
#         end_time = datetime.now()
#         print(f"Duration2: {end_time - start_time}")

#         start_time = datetime.now()
#         for i in range(1):
#             data = await exec_sql_asyncpg(
#                 dbName="demo_accounts", schema="demounit1", sql=sql, sqlArgs=sqlArgs
#             )
#         end_time = datetime.now()
#         print(f"Duration3: {end_time - start_time}")

#     except Exception as e:
#         print(e)

#     return data
