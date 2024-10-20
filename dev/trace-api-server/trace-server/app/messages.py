from app.config import Config


class Messages:
    err_access_token_missing = "Access token is missing in the request to server"
    err_access_token_signature_expired = "Access token signature is expired"
    err_access_token_signature_invalid = "Access token signature is invalid"
    err_access_token_invalid = "Access token is invalid"
    err_access_token_unknown_error = (
        "Unknown error occured while validating access token"
    )
    err_email_not_exists = "Email provided by you does not exist"
    err_email_send_error = "There was error in sending email. Email parameters from client are improper or missing"
    err_email_send_error_server = "There was error in sending email from server"
    err_email_not_provided = "Email is not provided"
    err_internal_server_error = "Internal server error"
    err_inactive_user = "Inactive user"
    err_invalid_uid = "The current UID given by you is incorrect"
    err_invalid_current_password = "The current password given by you is incorrect"
    err_invalid_password = "Invalid password"
    err_invalid_reset_password_link = 'The reset password link used by you is invalid'
    err_invalid_token_in_reset_password_link = "Invalid token was found in the reset password link used by you"
    err_invalid_username_or_email = "Invalid username or email"
    err_invalid_username_or_password = "Invalid username or password"
    err_link_expired = "This reset password link is already expired. Kindly generat another link"
    err_missing_sql_id = "SqlId not found in the client request"
    err_missing_username_password = "Missing username or password"
    err_reset_password_success_but_mail_send_fail = "Reset of password was successfully done, but corresponding mail sending was failed"
    err_unknown = "Unknown error"
    err_unknown_current_password_error = "Unknown error related to current password"
    err_url_not_found = "Specified api endpoint or url not found"
    
    mess_reset_password_success = 'Reset of the password is done successfully'


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
    e1016 = "Email send error. An email could not be sent"
    e1017 = "The current UID given by the user is wrong"
    e1018 = "The hash for current user was not found in database"
    e1019 = "The current password given by the user for purpose of change to new password was incorrect"
    e1020 = "For the selected client the email address given by the user does not exist in database"
    e1021 = "The reset password link used by the user is already expired"
    e1022 = "Invalid token found in the reset password link used by the user "
    e1023 = "The email provided by you does not exist"
    e1024 = "Reset password is successfully done but there was an error sending the confirmation mail"
    
    e2000 = "Error occurred while executing GraphQL query in file graphql_helper"


class EmailMessages:
    email_subject_update_user = "update of your user credentials"

    email_subject_change_uid = "change of uid"

    email_subject_change_pwd = "change of pwd"
    
    email_subject_reset_password_success = f'{Config.PACKAGE_NAME}: Reset of password is done successfully'

    email_subject_forgot_password_reset_link = (
        f"Reset password link for forgot passwordk for {Config.PACKAGE_NAME} "
    )

    def email_subject_new_user(userType):
        return f"new {userType} with your email address"

    def email_body_forgot_password_reset_link(resetPasswordLink: str):
        return f"""
            <!DOCTYPE html>
            <html>
            <head>
            <title>Reset password link</title>
            </head>
            <body>
            <h1>Reset password link</h1>
            <p>Dear Sir / Madam,</p>
            <p>Here is the reset password link for your account in {Config.PACKAGE_NAME}. Click this link to reset your password. Alternatively you can paste this link in ynour browser and browse</p>
            <p>This link is valid for one hour. Click this link to securely reset your password</p>
            <p>{resetPasswordLink}</p>
            <p>Thank you,</p>
            <p>{Config.PACKAGE_NAME}</p>
            </body>
            </html>
        """
        
    def email_body_reset_password_success(clientName: str, email: str, pwd: str):
        return f"""
            <!DOCTYPE html>
            <html>
            <head>
            <title>Reset of the password is successfully done</title>
            </head>
            <body>
            <h1>Reset of the password is successfully done</h1>
            <p>Dear Sir / Madam,</p>
            <p>Reset of password for your account in {Config.PACKAGE_NAME} is successfully done.
            <p><b>Email: {email}</b></p>
            <p><b>Client name: {clientName}</b></p>
            <p><b>New password: {pwd}</b></p>
            <p>You must change your password to human readable format as early as possible</p>
            <p>Thank you,</p>
            <p>{Config.PACKAGE_NAME}</p>
            </body>
            </html>
        """

    def email_body_change_pwd(userName, companyName, pwd):
        return f"""
    <!DOCTYPE html>
        <html>
        <head>
        <title>Password changed</title>
        <style>
            body {{
            font-family: sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #333;
            }}
            
            h1 {{
            font-size: 24px;
            margin-top: 0;
            }}
            
            p {{
            margin-bottom: 10px;
            }}
            
            ul {{
            margin-left: 20px;
            }}
            
            li {{
            list-style-type: none;
            margin-bottom: 5px;
            }}
            
            b {{
            font-weight: bold;
            }}
            
            .container {{
            width: 500px;
            }}
            
            .footer {{
            text-align: center;
            padding: 20px 0;
            }}
        </style>
        </head>
        <body>
        <div class="container">
            <h1>Password changed</h1>
            <p>Dear {userName},</p>
            <p>This is to inform you that your password for {companyName} is changed. The new password is as follows:</p>
            <p>
                <b>New password: {pwd}</b>
            </p>
            <p>Yours sincerely,</p>
            <dv>{companyName} team.</div>
        </div>
        </body>
        </html>
    """

    def email_body_change_uid(
        userName,
        companyName,
        uid,
    ):
        return f"""
    <!DOCTYPE html>
        <html>
        <head>
        <title>Changed uid</title>
        <style>
            body {{
            font-family: sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #333;
            }}
            
            h1 {{
            font-size: 24px;
            margin-top: 0;
            }}
            
            p {{
            margin-bottom: 10px;
            }}
            
            ul {{
            margin-left: 20px;
            }}
            
            li {{
            list-style-type: none;
            margin-bottom: 5px;
            }}
            
            b {{
            font-weight: bold;
            }}
            
            .container {{
            width: 500px;
            }}
            
            .footer {{
            text-align: center;
            padding: 20px 0;
            }}
        </style>
        </head>
        <body>
        <div class="container">
            <h1>UID changed</h1>
            <p>Dear {userName},</p>
            <p>This is to inform you that your uid is changed. The new uid is as follows:</p>
            <p>
                <b>New uid: {uid}</b>
            </p>
            <p>Yours sincerely,</p>
            <dv>{companyName} team.</div>
        </div>
        </body>
        </html>
    """

    def email_body_new_user(userName, companyName, uid, password, userType):
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
        <title>New {userType} created</title>
        <style>
            body {{
            font-family: sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #333;
            }}
            
            h1 {{
            font-size: 24px;
            margin-top: 0;
            }}
            
            p {{
            margin-bottom: 10px;
            }}
            
            ul {{
            margin-left: 20px;
            }}
            
            li {{
            list-style-type: none;
            margin-bottom: 5px;
            }}
            
            b {{
            font-weight: bold;
            }}
            
            .container {{
            width: 500px;
            }}
            
            .footer {{
            text-align: center;
            padding: 20px 0;
            }}
        </style>
        </head>
        <body>
        <div class="container">
            <h1>New {userType} created</h1>
            <p>Dear {userName},</p>
            <p>This is to inform you that a new {userType} has been created with your email address. Your uid and password are as follows:</p>
            <ul>
            <li>uid: <b>{uid}</b></li>
            <li>Password: <b>{password}</b></li>
            </ul>
            <p>Please change your uid and password to a human-readable format as soon as possible. You can login either using your email address or your uid.</p>
            <p>If you have any questions, please do not hesitate to contact us.</p>
            <p>Thank you,</p>
            <p>{companyName}</p>
        </div>
        </body>
        </html>
    """

    def email_body_update_user(userName, companyName):
        return f"""
    <!DOCTYPE html>
        <html>
        <head>
        <title>User Credentials Updated</title>
        </head>
        <body>
        <h1>User Credentials Updated</h1>
        <p>Dear {userName},</p>
        <p>This is to inform you that your user credentials have been updated. Your uid and password remain the same.</p>
        <p>Please login using your email address or your uid.</p>
        <p>If you have any questions, please do not hesitate to contact us.</p>
        <p>Thank you,</p>
        <p>{companyName}</p>
        </body>
        </html>
    """
