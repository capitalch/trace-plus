from ariadne import QueryType, make_executable_schema, load_schema_from_path
from ariadne.asgi import GraphQL
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
import json
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
    try:
        print("Test Exception")
        print(1/0)
        # return([{"name":"Sushant"}])
    except Exception as e:
        # return(JSONResponse(status_code=501, content={"message":"Internal GRaphQL Error"})) # not working
        # return(jsonable_encoder({"error":"Internal GraphQL error"})) # not working
        # raise HTTPException(detail='ABCD' , status_code=503)
        mess = e.args[0]
        return { # it works
            "error": {
                "content": {
                    "error_code": "e2000",
                    "message": "Graphql error occured",
                    "status_code": "400",
                    "detail": mess,
                }
            }
        }
        return('GraphQL error')

schema = make_executable_schema(type_defs, query)
GraphQLApp: GraphQL = GraphQL(schema, debug=True)