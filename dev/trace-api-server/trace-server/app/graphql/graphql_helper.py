import datetime
import json
from fastapi import status
from urllib.parse import unquote
from app.dependencies import AppHttpException
from app.messages import Messages
from .db.sql_security import allSqls
from .db.helpers.psycopg_async_helper import exec_sql
from .db.sql_security import SqlSerurity
async def generic_query_helper(info, value: str):
    error = {}
    data = {}
    try:
        valueString = unquote(value)
        valueDict = json.loads(valueString)
        dbParams = valueDict.get("dbParams", None)
        schema = valueDict.get("buCode", None)
        toReconnect = valueDict.get("toReconnect", False)
        sqlId = valueDict.get("sqlId", None)
        request = info.context.get("request", None)
        requestJson = await request.json()
        operationName = requestJson.get("operationName", None)
        sql = SqlSerurity.get_super_admin_dashboard
        data = await exec_sql(sql=sql, sqlArgs=valueDict)
        # if not sqlId:
        #     raise AppHttpException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         error_code="e1010",
        #         message=Messages.err_missing_sql_id,
        #     )

    except Exception as e:
        # Need to return error as data. Raise error does not work with GraphQL
        # At client check data for error attribut and take action accordingly
        return {
            "error": {
                "content": {
                    "error_code": "e2000",
                    "message": "Graphql error occured",
                    "status_code": "400",
                    "detail": e.message,
                }
            }
        }
    return data


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
