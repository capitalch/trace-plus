from fastapi.encoders import jsonable_encoder
from psycopg import OperationalError, AsyncConnection
from psycopg.conninfo import make_conninfo
from psycopg.rows import dict_row
from app.config import Config
from typing import Any
from types import FunctionType
from app.core.utils import get_env
from app.graphql.db.sql_accounts import SqlAccounts
from app.core.utils import decrypt
import json

dbParams: dict = {
    "user": Config.DB_USER,
    "password": Config.DB_PASSWORD,
    "ipAddress": Config.DB_IP_ADDRESS,
    "internalPort": Config.DB_INTERNAL_PORT,
    "port": Config.DB_PORT,
    "host": Config.DB_HOST,
}


def get_conn_info(
    dbName: str = Config.DB_NAME, db_params: dict[str, str] = dbParams
) -> str:
    dbName = Config.DB_NAME if dbName is None else dbName
    db_params = dbParams.copy() if db_params is None else db_params.copy()
    conn = db_params.get('conn', None)
    if (conn):
        conn = decrypt(conn)
        db_params = json.loads(conn)
    env = get_env()
    # Decide host and port based on environment
    if env == "development":
        db_params.pop("ipAddress")
        db_params.pop("internalPort")
    else:
        db_params["host"] = db_params.pop("ipAddress")
        db_params["port"] = db_params.pop("internalPort")

    # Set dbname and keepalive settings
    db_params["dbname"] = dbName
    db_params["keepalives"] = 1
    db_params["keepalives_idle"] = 30
    connInfo = make_conninfo("", **db_params)
    return connInfo


async def exec_sql(
    dbName: str = Config.DB_NAME,
    db_params: dict[str, str] = dbParams,
    schema: str = "public",
    sql: str = None,
    sqlArgs: dict[str, str] = {},
):
    connInfo = get_conn_info(dbName, db_params)
    records = []
    records = await do_process(connInfo, schema, dbName, sql, sqlArgs)
    return jsonable_encoder(records)


async def do_process(
    connInfo: str, schema: str, dbName: str, sql: str, sqlArgs
):
    records = []
    try:
        # Establish connection
        async with await AsyncConnection.connect(connInfo, row_factory=dict_row) as conn:
            await conn.set_autocommit(False)
            # Set the schema
            schema_to_set = schema or "public"
            async with conn.cursor() as cur:
                await cur.execute(f"SET search_path TO {schema_to_set}")

                # Execute the query
                if (isinstance(sql, FunctionType)):
                    await cur.execute(sql(sqlArgs))
                else:
                    await cur.execute(sql, sqlArgs)

                # Fetch data for SELECT queries or row count for DML
                if cur.rowcount > 0:
                    records = await cur.fetchall() if cur.description else cur.rowcount

            # Commit changes
            await conn.commit()

        return records

    except OperationalError as e:
        # OperationalError (e.g., connection issues)
        raise RuntimeError(f"Database operation failed: {e}") from e
    except Exception as e:
        # General exception with additional context
        raise RuntimeError(
            f"Unexpected error during database operation: {e}") from e


async def exec_sql_dml(
    dbName: str = Config.DB_NAME,
    db_params: dict[str, str] = dbParams,
    schema: str = "public",
    sql: str = "",
    sqlArgs: dict[str, str] = {},
):
    connInfo = get_conn_info(dbName, db_params)
    try:
        # autocommit to be turned on, otherwise dml statements will fail
        async with await AsyncConnection.connect(connInfo, autocommit=True) as aconn:
            await aconn.execute(f"set search_path to {schema or 'public'}")
            await aconn.execute(sql, sqlArgs)
            await aconn.close()
    except OperationalError as e:
        raise e
    except Exception as e:
        raise e


async def process_details(sqlObject: Any, acur: Any, fkeyValue=None):
    ret = None
    if "deletedIds" in sqlObject:
        await process_deleted_ids(sqlObject, acur)
    xData = sqlObject.get("xData", None)
    tableName = sqlObject.get("tableName", None)
    fkeyName = sqlObject.get("fkeyName", None)
    if xData:
        if type(xData) is list:
            for item in xData:
                ret = await process_data(item, acur, tableName, fkeyName, fkeyValue)
        else:
            ret = await process_data(xData, acur, tableName, fkeyName, fkeyValue)
    return ret


async def exec_sql_object(
    dbName: str = Config.DB_NAME,
    db_params: dict[str, str] = dbParams,
    schema: str = "public",
    execSqlObject: Any = process_details,
    sqlObject: Any = None,
):
    connInfo = get_conn_info(dbName, db_params)
    schema = "public" if schema is None else schema
    records = None
    try:
        async with await AsyncConnection.connect(connInfo) as aconn:
            await aconn.execute(f"set search_path to {schema or 'public'}")
            async with aconn.cursor(row_factory=dict_row) as acur:
                await handle_auto_ref_no(sqlObject, acur)
                await handle_auto_subledger(sqlObject, acur)
                # records = await execSqlObject(sqlObject, acur)
            await acur.close()
            await aconn.commit()
            await aconn.close()
    except OperationalError as e:
        raise e
    except Exception as e:
        raise e
    return records


async def handle_auto_ref_no(sqlObject, acur):
    xData = sqlObject.get("xData", {})
    if not xData:  # Check if xData is None or empty
        return
    if (
        ("id" not in xData or not xData["id"]) and
        ("finYearId" in xData) and
        ("branchId" in xData) and
        ("tranTypeId" in xData)
    ):
        finYearId = xData["finYearId"]
        branchId = xData["branchId"]
        tranTypeId = xData["tranTypeId"]
        # Fetch tranTypeCode and branchCode
        await acur.execute(SqlAccounts.get_branch_code_tran_code, {"branchId": branchId, "tranTypeId": tranTypeId})
        codes = await acur.fetchone()
        branchCode = codes.get("branchCode", "")
        tranCode = codes.get("tranCode", "")
        # Fetch lastNo from TranCounter; Add a row if not there
        await acur.execute(SqlAccounts.get_last_no, {"finYearId": finYearId, "branchId": branchId, "tranTypeId": tranTypeId})
        no = await acur.fetchone()
        lastNo = no.get("lastNo", 0)
        if lastNo == 0:
            lastNo = 1
        autoRefNo = f'{branchCode}/{tranCode}/{lastNo}/{finYearId}'
        # Replace autoRefNo in xData
        xData["autoRefNo"] = autoRefNo
        # Update TranCounter
        await acur.execute(SqlAccounts.increment_last_no, {"finYearId": finYearId, "branchId": branchId, "tranTypeId": tranTypeId})

# create new autoSubledger account and inject its id in sqlObject
async def handle_auto_subledger(sqlObject, acur):
    if (not sqlObject.get('autoSubledgerAccId', None)):
        return
    # populate variables
    # buCode = sqlObject.get('buCode', None)
    autoSubledgerAccId = sqlObject.get('autoSubledgerAccId', None)
    xData = sqlObject.get('xData', {})
    if not xData:  # Check if xData is None or empty
        # throw error
        raise ValueError("xData is required")
    accName = xData.get('accName', None)
    tranDate = xData.get('tranDate', None)
    # tranTypeId = xData.get('tranTypeId', None)
    finYearId = xData.get('finYearId', None)
    branchId = xData.get('branchId', None)
    contactsId = xData.get('contactsId', None)
    autoRefNo = xData.get('autoRefNo', None)
    xDetails = xData.get('xDetails', {})
    detailsData = xDetails[0].get("xData", None)[1] 
    # Get autoSubledger details: Error
    await acur.execute(SqlAccounts.get_auto_subledger_details, {
        "finYearId": finYearId,
        "branchId": branchId,
        "accId": autoSubledgerAccId,
        "contactsId": contactsId})
    details = await acur.fetchone()
    jsonResult = details.get("jsonResult", None)
    branchCode = jsonResult.get("branchCode", "")
    autoSubledgerDetails = jsonResult.get("autoSubledgerDetails", None)
    lastNo = autoSubledgerDetails.get("lastNo", 0)
    accTypeId = autoSubledgerDetails.get("accTypeId", None)
    classId = autoSubledgerDetails.get("classId", None)
    accClass = autoSubledgerDetails.get("accClass", None)
    contactNameMobileObject = details.get("contactNameMobile", None)
    contactName = contactNameMobileObject.get("contactName", "")
    mobileNumber = contactNameMobileObject.get("mobileNumber", "")
    nameWithMobile = f"{contactName}:{mobileNumber}"
    # Insert new child subledger acccount of autoSubledgerAccId
    accCode = f'{autoSubledgerAccId}/{branchCode}/{lastNo}/{finYearId}'
    accName = f'{tranDate} {autoRefNo}: {autoSubledgerAccId}/{branchCode}/{lastNo} {nameWithMobile}'
    await acur.execute(SqlAccounts.insert_account, {
        "accCode": accCode,
        "accName": accName,
        "accType": accTypeId,
        "parentId": autoSubledgerAccId,
        "accLeaf": 'S',
        "isPrimary": False,
        "classId": classId
    })
    newAcc = await acur.fetchone()
    newAccId = newAcc.get("id", None)
    # update new accId in sqlObject
    detailsData["accId"] = newAccId
    # update lastNo +1 for AutosubledgerCounter
    await acur.execute(SqlAccounts.update_auto_subledger_last_no, {
        "lastNo": lastNo + 1,
        "finYearId": finYearId,
        "branchId": branchId,
        "accId": autoSubledgerAccId
    })
    return


async def process_data(xData, acur, tableName, fkeyName, fkeyValue):
    xDetails = None
    id = None
    records = None
    if "xDetails" in xData:
        xDetails = xData.pop("xDetails")
    sql, tup = get_sql(xData, tableName, fkeyName, fkeyValue)
    if sql:
        await acur.execute(sql, tup)
        if acur.rowcount > 0:
            records = await acur.fetchone()
            id = records.get("id")
    if xDetails:
        if type(xDetails) is list:
            for item in xDetails:
                await process_details(item, acur, id)
        else:
            await process_details(xDetails, acur, id)
    return id

# id      isIdInsert      Result
# None    None            insert
# None    True            insert
# 100     None            update
# 100     True            insert

# if (xData.get("id", None)) and (not xData.get("isIdInsert", None)):
#     return "update"
# else:
#     return "insert"


def get_sql(xData, tableName, fkeyName, fkeyValue):
    sql = None
    valuesTuple = None
    if xData.get("id", None) and (not xData.get("isIdInsert", None)):  # update
        sql, valuesTuple = get_update_sql(xData, tableName)
    else:  # insert
        xData.pop('isIdInsert', None)
        sql, valuesTuple = get_insert_sql(
            xData, tableName, fkeyName, fkeyValue)
    return (sql, valuesTuple)


def get_insert_sql(xData, tableName, fkeyName, fkeyValue):
    fieldNamesList = list(xData.keys())
    if fkeyName and fkeyValue:
        fieldNamesList.append(fkeyName)
    fieldsCount = len(fieldNamesList)

    for idx, name in enumerate(fieldNamesList):
        fieldNamesList[idx] = f""" "{name}" """  # surround fields with ""
    fieldsString = ",".join(
        fieldNamesList)  # f'''({','.join( fieldNamesList   )})'''

    placeholderList = ["%s"] * fieldsCount
    placeholdersForValues = ", ".join(placeholderList)

    valuesList = list(xData.values())
    if fkeyName and fkeyValue:
        valuesList.append(fkeyValue)
    valuesTuple = tuple(valuesList)
    sql = f"""insert into "{tableName}"
        ({fieldsString}) values({placeholdersForValues}) returning id
        """
    return (sql, valuesTuple)


def get_update_sql(xData, tableName):
    def getUpdateKeyValuesString(dataCopy):
        dataCopy.pop("id")
        lst = []
        for item in dataCopy:
            lst.append(f""" "{item}" = %s""")
        keyValueStr = ", ".join(lst)
        valuesTuple = tuple(dataCopy.values())
        return (keyValueStr, valuesTuple)

    keyValueStr, valuesTuple = getUpdateKeyValuesString(xData.copy())
    sql = f"""
        update "{tableName}" set {keyValueStr}
            where id = {xData['id']} returning "{"id"}"
    """
    return (sql, valuesTuple)


async def process_deleted_ids(sqlObject, acur: Any):
    deletedIdList = sqlObject.get("deletedIds")
    if not deletedIdList:
        # If deletedIdList is None or empty, return early
        return
    tableName = sqlObject.get("tableName")
    ret = "("
    for x in deletedIdList:
        ret = ret + str(x) + ","
    ret = ret.rstrip(",") + ")"
    sql = f"""delete from "{tableName}" where id in{ret}"""
    await acur.execute(sql)
