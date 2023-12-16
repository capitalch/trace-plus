## **Fast api**
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


## **Notes on universal exception handling in fastapi**
# Through middleware
- app.middleware("http")(catch_exceptions_middleware)
  - This line enables all http calls to pass through the call_next(request) method of catch_exception_middleware
  - if anywhere in the code uncaught exception occurs then "except exception" part of this method is executed
  - This takes care of all unknown and accidental exceptions in code when any http call is made
# Raised exceptions
- If any http call is made and in this call a exception is raised through AppHttpException then this exception is handled directly
- for example if you write at any point
  ```
    raise AppHttpException(
        error_code='e1002', message='A custom exception from inside of code has occured',)
  ```
- This is executed directly and does not pass through the exception handler of middleware
# Raising 404 exception when end point is not found
- This is done like this:
  ```
    app.exception_handler(404)
    async def custom_404_handler(_, __):
      return (JSONResponse(status_code=404, content={'error_code': 'e1001', 'message': 'Direct 404 handle'}))
  ```
- When the url is not found the above exception is executed directly

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
