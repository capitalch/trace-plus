from ariadne import (
    load_schema_from_path,
    make_executable_schema,
    QueryType,
    MutationType,
)
from fastapi import Request
from ariadne.asgi import graphql, GraphQL
from fastapi.middleware.cors import CORSMiddleware
from app.graphql.graphql_helper import generic_query_helper, generic_update_helper, update_client_helper

type_defs = load_schema_from_path(".")
query = QueryType()
mutation = MutationType()

@query.field("genericQuery")
async def generic_query(_, info, value=""):
    request: Request = info.context["request"]
    return await generic_query_helper(info, value)

# @mutation.field("genericUpdate")
# async def generic_update(_, info, value=''):
#     return await (generic_update_helper(info, value))

@mutation.field("updateClient")
async def update_client(_, info, value=''):
    # request: Request = info.context["request"]
    return await (update_client_helper(info, value))

@query.field("hello")
async def hello(_, info):
    return {"status": "Hello world"}


schema = make_executable_schema(type_defs, query, mutation)
GraphQLApp = GraphQL(schema)
