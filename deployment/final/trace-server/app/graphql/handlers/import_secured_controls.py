from typing import Any
from app.graphql.db.psycopg_async_helper import get_conn_info
from psycopg import OperationalError, AsyncConnection
from psycopg.rows import dict_row
from app.graphql.db.sql_security import SqlSecurity

async def import_secured_controls(json_data:list[Any]):
    # SQL statement for insert or update
    sql = SqlSecurity.import_secured_controls
    connInfo = get_conn_info()
    records = []
    try:
        async with await AsyncConnection.connect(connInfo) as aconn:
            await aconn.execute(f"set search_path to public")
            async with aconn.cursor(row_factory=dict_row) as acur:
                await acur.executemany(sql, json_data)
                records = acur.rowcount
            await acur.close()
            await aconn.commit()
            await aconn.close()
    except OperationalError as e:
        raise e
    except Exception as e:
        raise e
    return records
    