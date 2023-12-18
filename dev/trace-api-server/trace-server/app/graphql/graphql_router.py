from ariadne import (
    load_schema_from_path,
    make_executable_schema,
    QueryType,
    MutationType,
)
from ariadne.asgi import graphql, GraphQL
from fastapi.middleware.cors import CORSMiddleware
from app.graphql.graphql_helper import generic_query_helper

type_defs = load_schema_from_path(".")
query = QueryType()

@query.field("genericQuery")
async def generic_query(_, info, value=''):
    return(await generic_query_helper())
    # return {"status": "Success Graphql query"}


@query.field("hello")
async def hello(_, info):
     return {"status": "Hello world"}


schema = make_executable_schema(type_defs, query)
GraphQLApp: GraphQL = CORSMiddleware(
    GraphQL(schema),
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)
