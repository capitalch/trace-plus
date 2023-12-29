class Messages:
    err_access_token_signature_expired = "Access token signature is expired"
    err_internal_server_error = "Internal server error"
    err_invalid_username_or_password = "Invalid username or password"
    err_missing_username_password = "Missing username or password"
    err_super_admin_user_config_data_missing = "Config data for super admin user is not found from configuration file at server"
    err_unknown = "Unknown error"
    err_url_not_found = "Specified url not found"


class customErrorCodes:
    e1000 = "An uncaught run time error has occured at server"
    e1001 = "API end point not found"
    e1002 = "An error was raised while running the server code"
    e1003 = "Either username or password was found missing"
    e1004 = "Super admin configuration details are missing. Please check the Config.py file at server"
    e1004 = "Either username or password is invalid. JWT verification failed for provided username and password. Could not generate access token"
    e1005 = "Database connection error at server. Check the connection params of database in Config file"
    e1006 = "Sql execution error. Maybe badly formed SQL query"
