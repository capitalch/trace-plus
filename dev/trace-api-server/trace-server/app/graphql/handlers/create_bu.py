import os
from pydantic import BaseModel
from typing import Optional
from fastapi import status
from app.graphql.db.helpers.psycopg_async_helper import (
    exec_sql,
    exec_sql_dml,
    exec_sql_object,
)
from app.graphql.db.sql_security import SqlSecurity
from app.messages import Messages
from app.dependencies import AppHttpException


class ClientDetails(BaseModel):
    clientCode: str = None
    isActive: bool = False
    isExternalDb: bool = False
    dbName: str = None
    dbParams: Optional[str] = None # allows null


async def create_bu(valueDict: dict) -> None:
    xData = valueDict["xData"]
    buCode = xData.get("buCode")
    clientId = xData.get("clientId")
    result = await exec_sql(
        sql=SqlSecurity.get_client_details_on_id, sqlArgs={"id": clientId}
    )
    # clientDetails: ClientDetails = ClientDetails(**result[0])
    if result:
        clientDetails: ClientDetails = ClientDetails(**result[0])
        # clientDetails.clientCode = result[0].get("clientCode")
        # clientDetails.dbName = result[0].get("dbName")
        # clientDetails.dbParams = result[0].get("dbParams")
        # clientDetails.isActive = result[0].get("isActive")
        # clientDetails.isExternalDb = result[0].get("isExternalDb")

    # Check if client details were retrieved successfully
    if not clientDetails:
        raise_app_http_exception(Messages.err_client_not_found, "e1025")

    # Check if the client is active
    if not clientDetails.isActive:
        raise_app_http_exception(Messages.err_client_not_found, "e1026")

    dbparams = None

    # Handle external database logic if applicable
    if clientDetails.isExternalDb:
        # TODO: Implement logic to check external DB connection and set dbParams
        pass

    # Check if the database exists
    doesDbExist = (
        await exec_sql(
            db_params=dbparams,
            sql=SqlSecurity.does_database_exist,
            sqlArgs={"dbName": clientDetails.dbName},
        )
    )[0].get("doesExist")

    if not doesDbExist:
        raise_app_http_exception(Messages.err_db_not_exists, "e1027")

    # Check if schema exists in db
    doesSchemaExistInDb = (
        await exec_sql(
            dbName=clientDetails.dbName,
            db_params=dbparams,
            sql=SqlSecurity.does_schema_exist_in_db,
            sqlArgs={"buCode": buCode},
        )
    )[0].get("doesExist")

    # Create public schema in DB if not exists. Execute script and then rename it to buCode
    if not doesSchemaExistInDb:
        sql = f"CREATE SCHEMA IF NOT EXISTS public"
        await exec_sql_dml(db_params=dbparams, dbName=clientDetails.dbName, sql=sql)
        currentDir = os.getcwd()
        scriptFilePath = os.path.join(currentDir, "app/graphql/scripts/accounts.sql")
        sql = open(scriptFilePath, "r").read()
        await exec_sql(dbName=clientDetails.dbName, db_params=dbparams, sql=sql)
        sql = f"alter schema public rename to {buCode}"
        await exec_sql_dml(dbName=clientDetails.dbName, db_params=dbparams, sql=sql)

    # Now enter details in TraceAuth db for the new schema
    await exec_sql_object(sqlObject=valueDict)


def raise_app_http_exception(detail: str, error_code: str) -> None:
    """Helper function to raise AppHttpException."""
    raise AppHttpException(
        detail=detail,
        error_code=error_code,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
