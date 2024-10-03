class Messages:
    err_access_token_missing = "Access token is missing in the request to server"
    err_access_token_signature_expired = "Access token signature is expired"
    err_access_token_signature_invalid = "Access token signature is invalid"
    err_access_token_invalid = "Access token is invalid"
    err_access_token_unknown_error = (
        "Unknown error occured while validating access token"
    )
    err_internal_server_error = "Internal server error"
    err_inactive_user = "Inactive user"
    err_invalid_password = "Invalid password"
    err_invalid_username_or_email = "Invalid username or email"
    err_invalid_username_or_password = "Invalid username or password"
    err_missing_sql_id = "SqlId not found in the client request"
    err_missing_username_password = "Missing username or password"
    err_unknown = "Unknown error"
    err_url_not_found = "Specified api endpoint or url not found"


class customErrorCodes:
    e1000 = "An uncaught run time error has occured at server"
    e1001 = "API end point not found. The end point queried by the client is not found in the server code"
    e1002 = "An error was raised while running the server code"
    e1003 = "Either username or password was found missing"
    e1004 = "Super admin configuration details are missing. Please check the Config.py file at server"
    e1004 = "Either username or the password is invalid. JWT verification failed for provided username and password. Could not generate access token"
    e1005 = "Database connection error at server. Check the connection params of database in Config file"
    e1006 = "Sql execution error. Maybe badly formed SQL query"
    e1007 = "Invalid user name or email"
    e1008 = "User is not active"
    e1009 = "Password is incorrect"
    e1010 = "SqlId is not found in the query sent to server. This is badly formed graphQL query"
    e1011 = "Access token signature expired. Please login again"
    e1012 = "Access token signature is invalid"
    e1013 = "Access token is invalid"
    e1014 = "Unknown error occured while validating access token"
    e1015 = "Access token is missing in the API request"
    
    
    
    
    e2000 = "Error occurred while executing GraphQL query in file graphql_helper"
