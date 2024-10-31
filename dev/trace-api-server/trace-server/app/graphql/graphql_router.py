from ariadne import (
    load_schema_from_path,
    make_executable_schema,
    QueryType,
    MutationType,
)

# from fastapi import Request
from ariadne.asgi import GraphQL
# from fastapi.middleware.cors import CORSMiddleware
from app.graphql.graphql_helper import (
    change_pwd_helper,
    change_uid_helper,
    create_bu_helper,
    decode_ext_db_params_helper,
    generic_query_helper,
    generic_update_helper,
    update_client_helper,
    update_user_helper,
)

type_defs = load_schema_from_path(".")
query = QueryType()
mutation = MutationType()


@query.field("decodeExtDbParams")
async def decode_ext_db_params(_, info, value=""):
    return await decode_ext_db_params_helper(info, value)


@mutation.field("createBu")
async def create_bu(_, info, value=""):
    return await create_bu_helper(info, value)


@query.field("genericQuery")
async def generic_query(_, info, value=""):
    return await generic_query_helper(info, value)


@mutation.field("genericUpdate")
async def generic_update(_, info, value=""):
    return await generic_update_helper(info, value)


@mutation.field("changePwd")
async def change_pwd(_, info, value=""):
    return await change_pwd_helper(info, value)


@mutation.field("changeUid")
async def change_uid(_, info, value):
    return await change_uid_helper(info, value)


@mutation.field("updateClient")
async def update_client(_, info, value=""):
    return await update_client_helper(info, value)


@mutation.field("updateUser")
async def update_user(_, info, value=""):
    return await update_user_helper(info, value)


@query.field("hello")
async def hello(_, info):
    return {"status": "Hello world"}


schema = make_executable_schema(type_defs, query, mutation)
GraphQLApp: GraphQL = GraphQL(schema)
