from ariadne import QueryType, make_executable_schema, load_schema_from_path
from ariadne.asgi import GraphQL
from fastapi import HTTPException

type_defs = load_schema_from_path(".")
query = QueryType()


@query.field("hello")
async def resolve_hello(_, info, value=""):
    return "Hello World"

@query.field("books")
async def resolve_books(*_):
    return [
        {"title": "Book 1", "author": "Author 1"},
        {"title": "Book 2", "author": "Author 2"},
        {"title": "Book 3", "author": "Author 3"},
    ]
@query.field("testException")
async def testException(*_):
    print("Test Exception")
    # return('ABCD')
    raise HTTPException(status_code=501, detail="This is a test exception from GraphQL")

schema = make_executable_schema(type_defs, query)
GraphQLApp: GraphQL = GraphQL(schema)