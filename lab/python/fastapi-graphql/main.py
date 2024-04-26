from fastapi import FastAPI
from ariadne import make_executable_schema, graphql_sync, ObjectType, gql, QueryType, MutationType

# Define GraphQL schema types (replace with your specific types)
type_Defs = gql("""
    type Query {
        hello(name: String!): String!
    }

    type Mutation {
        createUser(name: String!, email: String!): User!
    }

    type User {
        id: Int!
        name: String!
        email: String!
    }
""")

query = QueryType()
mutation = MutationType()

# Example resolvers (replace with your actual logic)
@query.field("hello")
def resolve_hello(obj, info, name):
    return f"Hello, {name}!"

@mutation.field("createUser")
def resolve_create_user(obj, info, name, email):
    # Implement user creation logic here
    # (e.g., connect to database, create user record)
    return {"id": 1, "name": name, "email": email}

schema = make_executable_schema(type_Defs, query, mutation)

app = FastAPI()

@app.get("/graphql")
async def graphql_endpoint(query: str):
    success, result = graphql_sync(schema, query, context_value={"request": app.request})
    if not success:
        raise Exception(result.get("errors")[0]["message"])
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
