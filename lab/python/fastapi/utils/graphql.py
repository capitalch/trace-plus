from ariadne import load_schema_from_path, make_executable_schema, QueryType, MutationType
from ariadne.asgi import graphql, GraphQL
from fastapi.middleware.cors import CORSMiddleware

type_defs = load_schema_from_path('utils')
query = QueryType()

@query.field('genericQuery')
async def generic_query(_, info, value = ''):
    return({'status': 'Success graphql'})

@query.field('hello')
async def hello(_, info):
    return({'status': 'Hello world'})

schema = make_executable_schema(type_defs, query)

GraphQLApp: GraphQL = CORSMiddleware(
    GraphQL(schema), allow_origins=['http://localhost:3000', 'http://127.0.0.1:3000','http://localhost:3001', 'http://127.0.0.1:3001'], allow_methods=['*'], allow_headers=['*'], allow_credentials=True
)
