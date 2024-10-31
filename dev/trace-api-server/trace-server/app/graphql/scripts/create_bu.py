from pydantic import BaseModel
from fastapi import status
from app.graphql.db.helpers.psycopg_async_helper import exec_sql
from app.graphql.db.sql_security import SqlSecurity
from app.messages import Messages
from app.dependencies import AppHttpException


class ClientDetails(BaseModel):
    clientCode: str
    isActive: bool
    isExternalDb: bool
    dbName: str
    dbParams: str


async def create_bu(buCode: str, clientId: str) -> None:
    clientDetails: ClientDetails = await exec_sql(
        sql=SqlSecurity.get_client_details_on_id, sqlArgs={"id": clientId}
    )

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
    doesDbExist = exec_sql(
        db_params=dbparams,
        sql=SqlSecurity.does_database_exist,
        sqlArgs={"dbName": clientDetails.dbName},
    ).get("doesExist")

    if not doesDbExist:
        raise_app_http_exception(Messages.err_db_not_exists, "e1027")

    # Check if the schema exists in the database
    doesSchemaExistInDb = exec_sql(
        db_params=dbparams,
        sql=SqlSecurity.does_schema_exist_in_db,
        sqlArgs={"buCode": buCode},
    ).get("doesExist")

    if not doesSchemaExistInDb:  # create schema
        pass


def raise_app_http_exception(detail: str, error_code: str) -> None:
    """Helper function to raise AppHttpException."""
    raise AppHttpException(
        detail=detail,
        error_code=error_code,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
