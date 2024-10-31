# import datetime
import json
from fastapi import status
from urllib.parse import unquote
from app.config import Config
from app.dependencies import AppHttpException
from app.security.security_utils import (
    getRandomUserId,
    getRandomPassword,
    getPasswordHash,
    verify_password,
)
from app.messages import Messages, EmailMessages
from app.mail import send_email
from .db.sql_security import allSqls
from .db.helpers.psycopg_async_helper import exec_sql, exec_sql_dml, exec_sql_object
from .db.sql_security import SqlSecurity
from app.utils import decrypt, encrypt, getSqlQueryObject, is_not_none_or_empty
from app.config import Config
from app.graphql.handlers.create_bu import ClientDetails, create_bu


async def change_pwd_helper(info, value):
    data = {}
    data1 = {}
    try:
        valueString = unquote(value)
        valueDict: dict = json.loads(valueString)
        request = info.context.get("request", None)
        requestJson = await request.json()
        operationName = requestJson.get("operationName", None)
        sqlQueryObject = getSqlQueryObject(operationName)
        sql = sqlQueryObject.get_user_hash
        sqlArgs = {"id": valueDict.get("id", None)}
        currentPwd = valueDict.get("currentPwd", None)
        data = await exec_sql(dbName=operationName, sql=sql, sqlArgs=sqlArgs)
        if data and len(data) > 0 and data[0].get("hash", False):
            # verify pwd
            hash = data[0].get("hash", False)
            if verify_password(currentPwd, hash):
                # save new password's hash in database
                pwd = valueDict.get("pwd", None)
                hash = getPasswordHash(pwd)
                sql = sqlQueryObject.update_user_hash
                sqlArgs = {"id": valueDict.get("id", None), "hash": hash}
                data1 = await exec_sql(dbName=operationName, sql=sql, sqlArgs=sqlArgs)
                # Send mail with new pwd
                email = valueDict.get("email", None)
                userName = valueDict.get("userName", None)
                await send_mail_for_change_pwd(
                    companyName=Config.PACKAGE_NAME,
                    email=email,
                    pwd=pwd,
                    userName=userName,
                )
            else:
                # current password invalid. Raise error
                raise AppHttpException(
                    message="Error",
                    detail=Messages.err_invalid_current_password,
                    error_code="e1019",
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        else:
            # password not found. Raise error
            raise AppHttpException(
                message="Error",
                detail=Messages.err_unknown_current_password_error,
                error_code="e1018",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    except Exception as e:
        # Need to return error as data. Raise error does not work with GraphQL
        # At client check data for error attribut and take action accordingly
        return create_graphql_exception(e)
    return data1


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
            uid = valueDict.get("uid", None)
            userName = valueDict.get("userName", None)
            await send_mail_for_change_uid(
                companyName=Config.PACKAGE_NAME, email=email, uid=uid, userName=userName
            )
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


async def create_bu_helper(info, value):
    data = {}
    try:
        valueString = unquote(value)
        valueDict = json.loads(valueString)
        xData = valueDict["xData"]
        buCode = xData.get("buCode")
        clientId = xData.get("clientId")
        await create_bu(buCode, clientId)

        # get db details based on clientId

        print(valueDict)
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
                    await exec_sql_dml(
                        dbName=operationName,
                        db_params=dbParams,
                        schema="public",
                        sql=f'CREATE DATABASE "{dbToCreate}"',
                    )
                    await exec_sql_dml(
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
        await send_mail_for_update_user(isUpdate, xData, pwd)
    except Exception as e:
        return create_graphql_exception(e)
    return data


# Local helper for helper methods


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


async def send_mail_for_change_pwd(
    companyName: str, email: str, pwd: str, userName: str
):
    subject = Config.PACKAGE_NAME + " " + EmailMessages.email_subject_change_pwd
    body = EmailMessages.email_body_change_pwd(userName, companyName, pwd)
    recipients = [email]
    try:
        await send_email(subject=subject, body=body, recipients=recipients)
    except Exception as e:
        raise AppHttpException(
            detail=Messages.err_email_send_error_server,
            error_code="e1016",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


async def send_mail_for_change_uid(
    companyName: str, email: str, uid: str, userName: str
):
    subject = Config.PACKAGE_NAME + " " + EmailMessages.email_subject_change_uid
    body = EmailMessages.email_body_change_uid(userName, companyName, uid)
    recipients = [email]
    try:
        await send_email(subject=subject, body=body, recipients=recipients)
    except Exception as e:
        raise AppHttpException(
            detail=Messages.err_email_send_error_server,
            error_code="e1016",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


async def send_mail_for_update_user(isUpdate: bool, xData: any, pwd: str):
    uid = xData.get("uid", None)
    email = xData.get("userEmail", None)
    userName = xData.get("userName", "user")
    companyName = Config.PACKAGE_NAME + " team."
    roleId = xData.get("roleId", None)
    userType = "Admin user" if roleId is None else "Business user"
    if isUpdate:
        subject = (
            Config.PACKAGE_NAME + " " + EmailMessages.email_subject_update_user
        )  # Note that this not a function
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
