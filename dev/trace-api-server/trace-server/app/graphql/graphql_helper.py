import datetime
import json
from fastapi import status, Request
from urllib.parse import unquote
from app.config import Config
from app.dependencies import AppHttpException
from app.security.security_utils import (
    getRandomUserId,
    getRandomPassword,
    getPasswordHash,
)
from app.messages import Messages, EmailMessages
from app.mail import send_email
from .db.sql_security import allSqls
from .db.helpers.psycopg_async_helper import exec_sql, execute_sql_dml, exec_sql_object
from .db.sql_security import SqlSecurity
from app.utils import decrypt, encrypt, getSqlQueryObject


async def change_uid_helper(info, value):
    data = {}
    try:
        valueString = unquote(value)
        valueDict: dict = json.loads(valueString)
        request = info.context.get("request", None)
        requestJson = await request.json()
        operationName = requestJson.get("operationName", None)
        sqlQueryObject = getSqlQueryObject(operationName)
        sql = sqlQueryObject.does_user_with_id_and_uid_exist
        sqlArgs = {"id": valueDict.get("id"), "uid": valueDict.get("currentUid")}
        data = await exec_sql(dbName=operationName, sql=sql, sqlArgs=sqlArgs)
        if data and len(data) > 0 and data[0].get("exists", False):
            # update uid
            sql = sqlQueryObject.update_user_uid
            sqlArgs = {"id": valueDict.get("id"), "uid": valueDict.get("uid")}
            data = await exec_sql(dbName=operationName, sql=sql, sqlArgs=sqlArgs)
            # successful. Now send mail
            email = valueDict.get("email", None)
            if email:
                subject = (
                    Config.PACKAGE_NAME
                    + " "
                    # + EmailMessages.email_subject_new_user(userType=userType)
                )
            body = "Email body"
            # EmailMessages.email_body_new_user(
            #     uid=uid,
            #     password=pwd,
            #     userName=userName,
            #     companyName=companyName,
            #     userType=userType,
            # )
            recipients = [email]
            await send_email(subject=subject, body=body, recipients=recipients)
        else:
            raise AppHttpException(
                message="Error",
                detail=Messages.err_invalid_uid,
                error_code="e1017",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
    # if user with current uid and id exists
    except Exception as e:
        # Need to return error as data. Raise error does not work with GraphQL
        # At client check data for error attribut and take action accordingly
        return create_graphql_exception(e)
    return data


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


async def update_user_helper(info, value: str):
    data = {}
    try:
        valueString = unquote(value)
        request = info.context.get("request", None)
        requestJson = await request.json()
        operationName = requestJson.get("operationName", None)
        sqlObj = json.loads(valueString)
        xData = sqlObj.get("xData", None)
        pwd = ""
        isUpdate = True
        if xData:
            id = xData.get("id", None)
            if id is None:
                isUpdate = False
                xData["uid"] = getRandomUserId()
                pwd = getRandomPassword()
                tHash = getPasswordHash(pwd)
                xData["hash"] = tHash
        data = await exec_sql_object(dbName=operationName, sqlObject=sqlObj)
        uid = xData.get("uid", None)
        email = xData.get("userEmail", None)
        userName = xData.get("userName", "user")
        companyName = Config.PACKAGE_NAME + " team."
        roleId = xData.get("roleId", None)
        userType = "Admin user" if roleId is None else "Business user"
        if isUpdate:
            subject = (
                Config.PACKAGE_NAME + " " + EmailMessages.email_subject_update_user
            )
            body = EmailMessages.email_body_update_user(
                userName=userName, companyName=companyName
            )
        else:
            subject = (
                Config.PACKAGE_NAME
                + " "
                + EmailMessages.email_subject_new_user(userType=userType)
            )
            body = EmailMessages.email_body_new_user(
                uid=uid,
                password=pwd,
                userName=userName,
                companyName=companyName,
                userType=userType,
            )
        recipients = [email]
        try:
            await send_email(subject=subject, body=body, recipients=recipients)
        except Exception as e:
            raise AppHttpException(
                detail=Messages.err_email_send_error_server,
                error_code="e1016",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
    except Exception as e:
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
        mess = getattr(e, "detail", None) or Messages.err_unknown
    error_code = getattr(e, "error_code", None) or "e2000"
    return {
        "error": {
            "content": {
                "error_code": error_code,
                "message": "Graphql error occured",
                "status_code": "400",
                "detail": mess,
            }
        }
    }
