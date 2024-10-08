import datetime
import json
from fastapi import status, Request
from urllib.parse import unquote
from app.dependencies import AppHttpException
from app.messages import Messages
from .db.sql_security import allSqls
from .db.helpers.psycopg_async_helper import exec_sql, execute_sql_dml, exec_sql_object
from .db.sql_security import SqlSecurity
from app.utils import decrypt, encrypt, getSqlQueryObject


async def decode_ext_db_params_helper(info, value):
    decodedDbParams = None
    try:
        decodedDbParams = decrypt(value)
    except Exception as e:
        return create_graphql_exception(e)
    return decodedDbParams


async def generic_update_helper(info, value: str):
    data = {}
    try:
        valueString = unquote(value)
        valueDict = json.loads(valueString)
        dbParams = valueDict.get("dbParams", None)
        schema = valueDict.get("buCode", None)
        # sqlId = valueDict.get("sqlId", None)
        request = info.context.get("request", None)
        requestJson = await request.json()
        operationName = requestJson.get("operationName", None)
        sqlObj = json.loads(valueString)

        data = await exec_sql_object(
            dbName=operationName, db_params=dbParams, schema=schema, sqlObject=sqlObj
        )

    except Exception as e:
        # Need to return error as data. Raise error does not work with GraphQL
        # At client check data for error attribut and take action accordingly
        return create_graphql_exception(e)
    return data


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
            # request,
            dbName=operationName,
            db_params=dbParams,
            schema=schema,
            sql=sql,
            sqlArgs=sqlArgs,
        )

    except Exception as e:
        # Need to return error as data. Raise error does not work with GraphQL
        # At client check data for error attribut and take action accordingly
        return create_graphql_exception(e)
    return data


async def update_client_helper(info, value: str):
    data = {}
    try:
        valueString = unquote(value)
        request = info.context.get("request", None)
        requestJson = await request.json()
        operationName = requestJson.get("operationName", None)
        sqlObj = json.loads(valueString)
        xData = sqlObj.get("xData", None)
        if xData:
            isExternalDb: bool = xData.get("isExternalDb", None)
            dbParams = xData.get("dbParams", None)
            if dbParams:
                # pass
                dbParamsEncrypted = encrypt(dbParams)
                xData["dbParams"] = dbParamsEncrypted
            dbToCreate = xData.get("dbName")
            if dbToCreate and (not isExternalDb):
                dbNameInCatalog: str = await exec_sql(
                    dbName=operationName,
                    db_params=dbParams,
                    schema="public",
                    sql=SqlSecurity.get_db_name_in_catalog,
                    sqlArgs={"datname": dbToCreate},
                )
                if not dbNameInCatalog:
                    await execute_sql_dml(
                        dbName=operationName,
                        db_params=dbParams,
                        schema="public",
                        sql=f'CREATE DATABASE "{dbToCreate}"',
                    )
                    await execute_sql_dml(
                        dbName=dbToCreate,
                        db_params=dbParams,
                        schema="public",
                        sql=SqlSecurity.drop_public_schema,
                    )
        data = await exec_sql_object(dbName=operationName, sqlObject=sqlObj)
    except Exception as e:
        # Need to return error as data. Raise error does not work with GraphQL
        # At client check data for error attribut and take action accordingly
        return create_graphql_exception(e)
    return data


def is_not_none_or_empty(value):
    ret = True
    if value is None:
        ret = False
    if isinstance(value, (tuple, list, set, dict)) and (len(value) == 0):
        ret = False
    return ret


def create_graphql_exception(e: Exception):
    mess = ""
    if is_not_none_or_empty(e.args):
        mess = e.args[0]
    else:
        mess = Messages.err_unknown
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
