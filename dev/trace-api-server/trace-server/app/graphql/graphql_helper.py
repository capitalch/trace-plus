from .db import exec_sql_psycopg2, exec_sql_psycopg_async, exec_sql_asyncpg
from datetime import datetime


async def generic_query_helper():
    sql = 'select * from "TranD"'
    data = []
    try:
        # start_time = datetime.now()
        # for i in range(1):
        #     data = exec_sql_psycopg2(
        #         dbName='demo_accounts', schema='demounit1', sql=sql)
        # end_time = datetime.now()
        # print(f'Duration1: {end_time - start_time}')
        
        start_time = datetime.now()
        for i in range(1):
            data = await exec_sql_psycopg_async(dbName='demo_accounts', schema='demounit1', sql=sql)
        end_time = datetime.now()
        print(f'Duration2: {end_time - start_time}')
        
        # start_time = datetime.now()
        # for i in range(1):
        #     data = await exec_sql_asyncpg(dbName='demo_accounts', schema='demounit1', sql=sql)
        # end_time = datetime.now()
        # print(f'Duration3: {end_time - start_time}')
        
    except Exception as e:
        print(e)

    return (data)
