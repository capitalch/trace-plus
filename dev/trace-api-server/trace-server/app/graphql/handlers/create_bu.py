import os
import logging
import json
from pathlib import Path
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
from app.utils import decrypt

logger = logging.getLogger(__name__)

class ClientDetails(BaseModel):
    clientCode: str
    isActive: bool = False
    isExternalDb: bool = False
    dbName: str
    dbParams: Optional[str] = None  # Allows null for dbParams


async def create_bu(valueDict: dict) -> None:
    xData = valueDict["xData"]
    buCode = xData.get("buCode")
    clientId = xData.get("clientId")
    
    logger.info(f"Fetching client details for clientId: {clientId}")
    
    # Retrieve client details from the database
    client_result = await exec_sql(sql=SqlSecurity.get_client_details_on_id, sqlArgs={"id": clientId})
    
    if not client_result:
        raise_app_http_exception(Messages.err_client_not_found, "e1025")

    clientDetails = ClientDetails(**client_result[0])

    # Check if the client is active
    if not clientDetails.isActive:
        raise_app_http_exception(Messages.err_client_inactive, "e1026")

    db_params = None

    # Handle external database logic if applicable
    if clientDetails.isExternalDb:
        # TODO: Implement logic to set dbParams when using external DB
        if(not clientDetails.dbParams):
            raise_app_http_exception(Messages.err_db_params_missing_in_ext_database, "e1027")
        # decode dbParams
        db_params_string = decrypt(clientDetails.dbParams)
        db_params = json.loads(db_params_string)
        # remove url from db_params
        if('url' in db_params):
            del db_params['url']
        

    # Check if the database exists in case of not external database
    if(not clientDetails.isExternalDb):
        logger.info(f"Checking if database {clientDetails.dbName} exists.")
        db_exists_result = await exec_sql(
            db_params=db_params,
            sql=SqlSecurity.does_database_exist,
            sqlArgs={"dbName": clientDetails.dbName},
        )
        
        does_db_exist = db_exists_result[0].get("doesExist", False)
        if not does_db_exist:
            raise_app_http_exception(Messages.err_db_not_exists, "e1027")

    # Check if the schema exists in the database
    logger.info(f"Checking if schema {buCode} exists in the database.")
    schema_exists_result = await exec_sql(
        dbName=clientDetails.dbName,
        db_params=db_params,
        sql=SqlSecurity.does_schema_exist_in_db,
        sqlArgs={"buCode": buCode},
    )
    
    does_schema_exist = schema_exists_result[0].get("doesExist", False)

    # Create schema and execute SQL script if the schema doesn't exist
    if not does_schema_exist:
        await create_schema_and_execute_script(clientDetails.dbName, buCode, db_params)

    # Insert the new schema details into TraceAuth db
    await exec_sql_object(sqlObject=valueDict)


async def create_schema_and_execute_script(db_name: str, bu_code: str, db_params) -> None:
    """Create schema and execute SQL script for the business unit."""
    
    logger.info(f"Creating schema and executing script for {bu_code} in database {db_name}.")
    
    # Create the public schema if it doesn't exist
    await exec_sql_dml(
        db_params=db_params,
        dbName=db_name,
        sql="CREATE SCHEMA IF NOT EXISTS public;"
    )

    # Read and execute the SQL script from file
    script_path = Path(os.getcwd()) / "app/graphql/scripts/accounts.sql"
    
    with script_path.open("r") as script_file:
        sql_script = script_file.read()

    logger.info("Executing the accounts.sql script.")
    await exec_sql(dbName=db_name, db_params=db_params, sql=sql_script)

    # Rename the public schema to the new business unit code
    rename_schema_sql = f"ALTER SCHEMA public RENAME TO {bu_code};"
    await exec_sql_dml(
        dbName=db_name,
        db_params=db_params,
        sql=rename_schema_sql,
    )


def raise_app_http_exception(detail: str, error_code: str) -> None:
    """Helper function to raise AppHttpException with a standardized message."""
    logger.error(f"Error {error_code}: {detail}")
    raise AppHttpException(
        detail=detail,
        error_code=error_code,
        message=detail,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
