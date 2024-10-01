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

## **Creating and activating virtual env in windows in context of Trace**
Download and Install Python from installer
cd c:\projects\trace-plus
1. python -m pip install virtualenv
2. python -m venv env
3. env\Scripts\activate
4. pip install pydantic fastapi uvicorn[standard] typing ariadne bcrypt pyjwt[crypto] psycopg2 psycopg[binary,pool] asyncpg
# This was used in case of Trace
4. pip install flask demjson simplejson psycopg2 requests ariadne pandas flask_cors nested_lookup flask_mail pyjwt datetime bcrypt autopep8 xlsxwriter flask_scss flask_weasyprint babel

## **Notes on universal exception handling in fastapi**
There are two types of exceptions:
# Caught exceptions: 
- When you are able to catch some exception in your code and you raise that exception with your own context information. This raised exception is now caught by a custom method with HTTPException as argument.
  
  @app.exception_handler(HttpException)
  async def handle_http_exception(request,ex):
    return JSONResponse(status_code=exc.status_code, content={"message": exc.detail})

- You can also create a subclass of HTTPException say AppHTTPException to add more attributes and work in similar manner.
- If any http call is made and in this call a exception is raised through AppHttpException then this exception is handled directly
- for example if you write at any point
  ```
    raise AppHttpException(
        error_code='e1002', message='A custom exception from inside of code has occured',)
  ```
- This is executed directly and does not pass through the exception handler of middleware

# Uncaught exceptions handled through http middleware: 
When due to some error in program, somewhere some exception is generated and it is uncaught. It spits lot of stack info in terminal. This uncaught exception is handled through http middleware. Basically all calls are routed through this middleware function surrounded by a try catch. If any error happens in the calll execution, that is caught by try catch and properly handled.
- app.middleware("http")(catch_exceptions_middleware)
  - This line enables all http calls to pass through the call_next(request) method of catch_exception_middleware
  - if anywhere in your software uncaught exception occurs then catch block or except block is executed
  - This takes care of all unknown and accidental exceptions in code when any http call is made
  - At first you define the handle function with request and call_next parameters. Then you attach the handler function to the app
```
  async def handle_exceptions(request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": e.args[0]})

  app.middleware('http')(
      handle_exceptions
  )
```
- You can also handle specific exception such as 404 exception in following manner
- There can be any number of app.exception_handler in the software
# handling 404 exception when end point is not found
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
## Authentication graphql
- Free from authentication is /graphql/exempted