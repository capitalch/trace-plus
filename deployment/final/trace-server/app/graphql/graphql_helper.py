import json
import pandas as pd
import logging
from fastapi import Response, status
from fastapi.responses import FileResponse
from io import BytesIO
from typing import Literal, List
from urllib.parse import unquote
from app.config import Config
from app.core.dependencies import AppHttpException
from app.security.security_utils import (
    getRandomUserId,
    getRandomPassword,
    getPasswordHash,
    verify_password,
)
from app.core.messages import Messages, EmailMessages
from app.core.mail import send_email
from .db.psycopg_async_helper import exec_sql, exec_sql_dml, exec_sql_object
from .db.sql_security import SqlSecurity
from .db.sql_accounts import SqlAccounts
from app.core.utils import decrypt, encrypt, getSqlQueryObject, is_not_none_or_empty
from app.config import Config
from app.graphql.handlers.create_bu import create_bu
from app.graphql.handlers.import_secured_controls import import_secured_controls
from decimal import Decimal

logger = logging.getLogger(__name__)


async def accounts_master_helper(info, dbName, value):
    data = []
    valueString = unquote(value)
    valueDict = json.loads(valueString)
    dbParams = valueDict.get("dbParams", None)
    schema = valueDict.get("buCode", None)
    sql = SqlAccounts.get_accounts_master
    sqlArgs = valueDict.get("sqlArgs", {})
    try:
        res = await exec_sql(
            dbName=dbName, db_params=dbParams, schema=schema, sql=sql, sqlArgs=sqlArgs
        )
        flat_data = res[0].get("jsonResult")
        if flat_data is not None:
            accountsMaster = (
                build_nested_hierarchy_with_children(
                    flat_data.get("accountsMaster"))
                if flat_data.get("accountsMaster") is not None
                else None
            )
        # data.append({"jsonResult": {"accountsMaster": accountsMaster}})
        data.append({"jsonResult": accountsMaster})
    except Exception as e:
        # Need to return error as data. Raise error does not work with GraphQL
        # At client check data for error attribut and take action accordingly
        return create_graphql_exception(e)
    return data


async def accounts_opening_balance_helper(info, dbName, value):
    data = []
    valueString = unquote(value)
    valueDict = json.loads(valueString)
    dbParams = valueDict.get("dbParams", None)
    schema = valueDict.get("buCode", None)
    sql = SqlAccounts.get_accounts_opening_balance
    sqlArgs = valueDict.get("sqlArgs", {})
    try:
        res = await exec_sql(
            dbName=dbName, db_params=dbParams, schema=schema, sql=sql, sqlArgs=sqlArgs
        )
        opBalance = (
            build_nested_hierarchy_with_children(
                res) if res is not None else None
        )
        data = opBalance
        # data.append({"jsonResult": {"accountsOpeningBalance": opBalance}})
    except Exception as e:
        # Need to return error as data. Raise error does not work with GraphQL
        # At client check data for error attribut and take action accordingly
        return create_graphql_exception(e)
    return data


async def balance_sheet_profit_loss_helper(info, dbName, value):
    data = []
    valueString = unquote(value)
    valueDict = json.loads(valueString)
    dbParams = valueDict.get("dbParams", None)
    schema = valueDict.get("buCode", None)
    sql = SqlAccounts.get_balanceSheet_profitLoss
    sqlArgs = valueDict.get("sqlArgs", {})
    try:
        res = await exec_sql(
            dbName=dbName, db_params=dbParams, schema=schema, sql=sql, sqlArgs=sqlArgs
        )
        flat_data = res[0].get("jsonResult")
        if flat_data is not None:
            profitOrLoss = flat_data.get("profitOrLoss")
            liabilities = (
                build_nested_hierarchy_with_children(
                    flat_data.get("liabilities"))
                if flat_data.get("liabilities") is not None
                else None
            )
            assets = (
                build_nested_hierarchy_with_children(flat_data.get("assets"))
                if flat_data.get("assets") is not None
                else None
            )
            expenses = (
                build_nested_hierarchy_with_children(flat_data.get("expenses"))
                if flat_data.get("expenses") is not None
                else None
            )
            incomes = (
                build_nested_hierarchy_with_children(flat_data.get("incomes"))
                if flat_data.get("incomes") is not None
                else None
            )
            data.append(
                {
                    "jsonResult": {
                        "profitOrLoss": profitOrLoss,
                        "liabilities": liabilities,
                        "assets": assets,
                        "expenses": expenses,
                        "incomes": incomes,
                    }
                }
            )
    except Exception as e:
        # Need to return error as data. Raise error does not work with GraphQL
        # At client check data for error attribut and take action accordingly
        return create_graphql_exception(e)
    return data


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
        sqlArgs = {"id": valueDict.get(
            "id"), "uid": valueDict.get("currentUid")}
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
        await create_bu(valueDict)
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


async def generic_query_helper(info, dbName: str, value: str):
    data = {}
    try:
        valueString = unquote(value)
        valueDict = json.loads(valueString)
        dbParams = valueDict.get("dbParams", None)
        schema = valueDict.get("buCode", None)
        sqlId = valueDict.get("sqlId", None)
        sqlQueryObject = getSqlQueryObject(dbName)
        sql = getattr(sqlQueryObject, sqlId, None)
        sqlArgs = valueDict.get("sqlArgs", {})
        data = await exec_sql(
            dbName=dbName,
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


async def generic_update_helper(info, dbName: str, value: str):
    data = {}
    try:
        valueString = unquote(value)
        valueDict = json.loads(valueString)
        dbParams = valueDict.get("dbParams", None)
        schema = valueDict.get("buCode", None)
        sqlObj = json.loads(valueString)
        data = await exec_sql_object(
            dbName=dbName, db_params=dbParams, schema=schema, sqlObject=sqlObj
        )

    except Exception as e:
        # Need to return error as data. Raise error does not work with GraphQL
        # At client check data for error attribut and take action accordingly
        return create_graphql_exception(e)
    return data

async def generic_update_query_helper(info, dbName: str, value: str):
    data = {}
    try:
        valueString = unquote(value)
        valueDict = json.loads(valueString)
        dbParams = valueDict.get("dbParams", None)
        schema = valueDict.get("buCode", None)
        sqlId = valueDict.get("sqlId", None)
        sqlQueryObject = getSqlQueryObject(dbName)
        sql = getattr(sqlQueryObject, sqlId, None)
        sqlArgs = valueDict.get("sqlArgs", {})
        data = await exec_sql(
            dbName=dbName,
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


async def import_secured_controls_helper(info, value: str):
    data = {}
    try:
        valueString = unquote(value)
        json_data = json.loads(valueString)
        await import_secured_controls(json_data)
    except Exception as e:
        return create_graphql_exception(e)
    return data


async def product_categories_helper(info, dbName, value):
    data = []
    valueString = unquote(value)
    valueDict = json.loads(valueString)
    dbParams = valueDict.get("dbParams", None)
    schema = valueDict.get("buCode", None)
    sql = SqlAccounts.get_product_categories
    sqlArgs = valueDict.get("sqlArgs", {})
    try:
        res = await exec_sql(
            dbName=dbName, db_params=dbParams, schema=schema, sql=sql, sqlArgs=sqlArgs
        )
        flat_data = res[0].get("jsonResult")
        if flat_data is not None:
            productCategories = (
                build_nested_hierarchy_with_children(
                    flat_data.get("productCategories"))
                if flat_data.get("productCategories") is not None
                else None
            )
        # data.append({"jsonResult": {"productCategories": productCategories}})
        data.append({"jsonResult": productCategories})
    except Exception as e:
        # Need to return error as data. Raise error does not work with GraphQL
        # At client check data for error attribut and take action accordingly
        return create_graphql_exception(e)
    return data


async def trial_balance_helper(info, dbName, value):
    data = []
    valueString = unquote(value)
    valueDict = json.loads(valueString)
    dbParams = valueDict.get("dbParams", None)
    schema = valueDict.get("buCode", None)
    sql = SqlAccounts.get_trial_balance
    sqlArgs = valueDict.get("sqlArgs", {})
    try:
        res = await exec_sql(
            dbName=dbName, db_params=dbParams, schema=schema, sql=sql, sqlArgs=sqlArgs
        )
        flat_data = res[0].get("jsonResult").get("trialBalance")
        if flat_data is not None:
            data.append(
                {"jsonResult": build_nested_hierarchy_with_children(flat_data)})
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
        clientCode = xData.pop('clientCode', None)
        clientName = xData.pop('clientName', None)
        data = await exec_sql_object(dbName=operationName, sqlObject=sqlObj)
        # Mail settings: in config.py: Only effective as long as domain kushinfotech.in is working from milesweb. At present subscription is for 3 years till Nov 2027
        await send_mail_for_update_user(isUpdate, xData, pwd, clientCode, clientName)
    except Exception as e:
        return create_graphql_exception(e)
    return data

async def validate_debit_credit_and_update_helper(info, dbName: str, value: str):
    data = {}
    try:
        valueString = unquote(value)
        valueDict = json.loads(valueString)
        # Code to validate debit credit
        isDebitsEqualCredits = validate_each_tran_entry(valueDict)
        if(not isDebitsEqualCredits):
            raise AppHttpException(
            message="Error",
            detail=Messages.err_debit_credit_validation_error,
            error_code="e1030",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
        dbParams = valueDict.get("dbParams", None)
        schema = valueDict.get("buCode", None)
        sqlObj = json.loads(valueString)
        data = await exec_sql_object(
            dbName=dbName, db_params=dbParams, schema=schema, sqlObject=sqlObj
        )

    except Exception as e:
        # Need to return error as data. Raise error does not work with GraphQL
        # At client check data for error attribut and take action accordingly
        return create_graphql_exception(e)
    return data

def validate_each_tran_entry(data: dict) -> bool:
    try:
        x_details = data["xData"]["xDetails"]
        for detail_group in x_details:
            entries = detail_group.get("xData", [])
            debit_total = sum(Decimal(str(x.get("amount", 0))) for x in entries if x.get("dc") == "D")
            credit_total = sum(Decimal(str(x.get("amount", 0))) for x in entries if x.get("dc") == "C")

            if debit_total != credit_total:
                print(f"Mismatch found: Debit={debit_total}, Credit={credit_total}")
                return False
        return True
    except (KeyError, IndexError, TypeError) as e:
        print(f"Validation error: {e}")
        return False
# Local helper for helper methods


# Generated from AI
def build_nested_hierarchy_with_children(flat_data):
    # Create a dictionary mapping account IDs to their respective data
    id_to_node = {item["id"]: {**item, "children": []} for item in flat_data}

    # Iterate over each record to assign children nodes
    for item in flat_data:
        children = item.get("children", [])  #
        if children is None:  # Handle None case
            continue
        for child_id in children:
            if child_id in id_to_node:
                id_to_node[item["id"]]["children"].append(id_to_node[child_id])

    # Extract only the top-level nodes (those not referenced as children)
    all_children_ids = {
        # child_id for item in flat_data for child_id in item.get("children", [])
        child_id
        for item in flat_data
        for child_id in (item.get("children") or [])
    }
    roots = [
        node for node_id, node in id_to_node.items() if node_id not in all_children_ids
    ]
    return roots


def create_graphql_exception(e: Exception):
    mess = ""
    if is_not_none_or_empty(e.args):
        mess = e.args[0]
    else:
        mess = getattr(e, "detail", None) or Messages.err_unknown
    error_code = getattr(e, "error_code", None) or "e2000"
    logger.error(f"GraphQl error occured. {mess}")
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
            message="Error",
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
            message="Error",
            detail=Messages.err_email_send_error_server,
            error_code="e1016",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


async def send_mail_for_update_user(isUpdate: bool, xData: any, pwd: str, clientCode:str, clientName: str):
    uid = xData.get("uid", None)
    email = xData.get("userEmail", None)
    userName = xData.get("userName", "user")
    companyName = Config.PACKAGE_NAME + " team."
    roleId = xData.get("roleId", None)
    userType = "Admin user" if roleId is None else "Business user"
    # clientCode = xData.get("clientCode", None)
    # clientName = xData.get("clientName", None)
    if isUpdate:
        subject = (
            Config.PACKAGE_NAME + " " + EmailMessages.email_subject_update_user
        )  # Note that this not a function
        body = EmailMessages.email_body_update_user(
            userName=userName, companyName=companyName, clientCode=clientCode, clientName=clientName
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
            clientCode=clientCode,
            clientName=clientName
        )
    recipients = [email]
    try:
        await send_email(subject=subject, body=body, recipients=recipients)
    except Exception as e:
        raise AppHttpException(
            message="Error",
            detail=Messages.err_email_send_error_server,
            error_code="e1016",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
