## Fast api
- Create virtual env and pip install fastapi uvicorn[standard]
  from typing import Union
  from fastapi import FastAPI

  app = FastAPI()

  @app.get('/')
  def read_root():
      return('Hello world')
- For using Routes from another file use ApiRouter of fastApi
- When doing Post request and using Pydantic, use Content-Type: application/json. This is important. Wasted my lot of time.
- fastapi status.200_ok like gives all status codes. No need to remember.

# GraphQL
- In fastapi to use GraphQL you need to create a new graphql app which is added on main app
    ```
      GraphQLApp: GraphQL = CORSMiddleware(
        GraphQL(schema), allow_origins=['http://localhost:3000', 'http://127.0.0.1:3000', '*'], allow_methods=['*'], allow_headers=['*'], allow_credentials=True
    )
    ```
  - app.add_route('/graphql/', GraphQLApp)
  - You must add CORS separately for GraphQL
  - Type safety is possible with schema file
    ```
    type Query {
        genericQuery(value: Generic): Generic
        hello: Generic
        hello1: String
        hello2(value: MyArgsInput): MyObj
        
    }

    type MyObj {
        status: String
        name: String
    }

    input MyArgsInput {
        sqlId: String
    }

    scalar Generic
    ```
