import asyncio
from psycopg_pool import AsyncConnectionPool, ConnectionPool
from psycopg.conninfo import make_conninfo
from psycopg.rows import dict_row
import config

dbParams: dict = {
    "user": config.Config.DB_USER,
    "password": config.Config.DB_PASSWORD,
    "host": config.Config.DB_HOST,
    "port": config.Config.DB_PORT,
}


def get_conn_info(
    dbName: str = config.Config.DB_SECURITY_DATABASE, db_params: dict[str, str] = dbParams
) -> str:
    db_params.update({'dbname': dbName})
    connInfo = make_conninfo("", **db_params)
    return(connInfo)

async def exec_sql_async(sql: str) -> None:
    async with AsyncConnectionPool(get_conn_info()) as pool:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute(sql)
                cur.nextset()
                rec = await cur.fetchall()
                return(rec)

async def main():
    rec = await exec_sql_async('set search_path to "public"; SELECT * FROM "UserM" ')
    print(rec)
    # await asyncio.sleep(0)

asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
loop = asyncio.get_event_loop()
loop.run_until_complete(main())


