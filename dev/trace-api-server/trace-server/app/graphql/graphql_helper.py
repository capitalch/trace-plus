from app.db.helpers import exec_sql_psycopg2, exec_sql_async_psycopg
from datetime import datetime

async def generic_query_helper():
    sql = 'select * from "TranD"'
    try:
        start_time = datetime.now()
        data = exec_sql_psycopg2(dbName='demo_accounts',schema='demounit1',sql= sql)
        end_time = datetime.now()
        print(f'Duration1: {end_time - start_time}')
        start_time = datetime.now()
        data = await exec_sql_async_psycopg(dbName='demo_accounts',schema='demounit1',sql= sql)
        end_time = datetime.now()
        print(f'Duration2: {end_time - start_time}')
    except Exception as e:
        print(e)

    return(data)