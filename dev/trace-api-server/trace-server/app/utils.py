from app.graphql.db.sql_main import SqlMain
from app.graphql.db.sql_security import SqlSecurity
def getSqlQueryObject(dbName: str):
    queryObject = SqlMain
    if (dbName == 'traceAuth'):
        queryObject = SqlSecurity
    return (queryObject)