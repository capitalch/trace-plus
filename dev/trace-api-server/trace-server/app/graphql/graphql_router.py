from ariadne import (
    load_schema_from_path,
    make_executable_schema,
    QueryType,
    MutationType,
)
from ariadne.asgi import graphql, GraphQL
from app.vendors import CORSMiddleware
from app.graphql.graphql_helper import generic_query_helper
from app.dependencies import AppHttpException, app_http_exception_handler, catch_exceptions_middleware 
from fastapi.middleware import Middleware

type_defs = load_schema_from_path(".")
query = QueryType()


@query.field("genericQuery")
async def generic_query(_, info, value=""):
    return await generic_query_helper(info, value)
    # return {"status": "Success Graphql query"}


@query.field("hello")
async def hello(_, info):
    return {"status": "Hello world"}


schema = make_executable_schema(type_defs, query)

# GraphQLApp = GraphQL(schema)
# GraphQLApp.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:3000",
#         "http://127.0.0.1:3000",
#         "http://localhost:3001",
#         "*"
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
GraphQLApp: GraphQL = CORSMiddleware(
    GraphQL(schema),
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
    
)

GraphQLApp = Middleware(GraphQLApp, catch_exceptions_middleware)

# GraphQLApp.middleware('http')(catch_exceptions_middleware)

