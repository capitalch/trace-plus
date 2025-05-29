from fastapi import status, Request
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta, timezone
from app.core.dependencies import (
    AppHttpException,
    UserClass,
    SuperAdminUserClass,
)
from app.core.messages import Messages
from app.config import Config
from app.security.security_utils import (
    create_access_token,
    create_jwt_token,
    verify_password,
)
from app.graphql.db.sql_security import SqlSecurity
from app.graphql.db.psycopg_async_helper import exec_sql
from app.core.utils import is_not_none_or_empty, get_env
from app.core.messages import EmailMessages
from app.core.mail import send_email
from jwt.exceptions import (
    ExpiredSignatureError,
    InvalidSignatureError,
    InvalidTokenError,
)
from app.security.security_utils import (
    getRandomPassword,
    getPasswordHash,
)
from app.core.utils import get_env
import base64, logging, jwt


async def forgot_password_helper(request: Request):
    try:
        json_data = await request.json()
        email = json_data.get("email", None)
        clientId = json_data.get("clientId", None)
        ret: list = await exec_sql(
            sql=SqlSecurity.does_user_email_exist,
            sqlArgs={"clientId": clientId, "email": email},
        )
        if is_not_none_or_empty(ret) and ret[0].get("exists"):
            # Email exists; hence send mail with reset link
            resetLink = get_reset_link(request, clientId, email)
            subject = EmailMessages.email_subject_forgot_password_reset_link
            body = EmailMessages.email_body_forgot_password_reset_link(
                resetLink)
            await send_email(subject=subject, body=body, recipients=[email])
        else:
            # Error email does not exist in database
            raise AppHttpException(
                error_code="e1020",
                message=Messages.err_email_not_exists,
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="",
            )
        pass
    except Exception as e:
        raise e


async def reset_password_helper(token: str):
    try:
        # decode token for base64
        tkn = base64.b64decode(token)
        result = jwt.decode(
            tkn, Config.ACCESS_TOKEN_SECRET_KEY, algorithms=Config.ALGORITHM
        )
        data = result.get("data", None)  # data has clientID and email
        clientId = data.get("clientId", None)
        email = data.get("email", None)
        sql = SqlSecurity.get_userId_client_name_on_clientId_email
        sqlArgs = {"clientId": clientId, "email": email}
        res = await exec_sql(sql=sql, sqlArgs=sqlArgs)
        if is_not_none_or_empty(res) and res[0].get("clientName", None):
            clientName = res[0].get("clientName")
            userId = res[0].get("id")
            # create a random password
            pwd = getRandomPassword()
            tHash = getPasswordHash(pwd)
            # update hash in database
            sql = SqlSecurity.update_user_hash
            sqlArgs = {"id": userId, "hash": tHash}
            res = await exec_sql(sql=sql, sqlArgs=sqlArgs)
            # Send mail to user for new password
            subject = EmailMessages.email_subject_reset_password_success
            body = EmailMessages.email_body_reset_password_success(
                clientName, email, pwd
            )
            recipients = [email]
            try:
                await send_email(subject=subject, body=body, recipients=recipients)
            except Exception as e:
                raise AppHttpException(
                    error_code="e1024",
                    message=Messages.err_reset_password_success_but_mail_send_fail,
                )
        else:
            raise AppHttpException(
                error_code="e1023",
                message=Messages.err_email_not_exists,
            )

    except ExpiredSignatureError as e1:
        raise AppHttpException(
            error_code="e1021",
            message=Messages.err_link_expired,
        )
    except InvalidSignatureError as e2:
        raise AppHttpException(
            error_code="e1021",
            message=Messages.err_invalid_reset_password_link,
        )
    except InvalidTokenError as e3:
        raise AppHttpException(
            error_code="e1022",
            message=Messages.err_invalid_token_in_reset_password_link,
        )
    except Exception as e4:
        raise e4
    return Messages.mess_reset_password_success


async def login_clients_helper(request: Request):
    body = await request.json()
    criteria = body.get("criteria")
    env = get_env()
    logging.debug(f"Login clients helper called in environment: {env}")
    if criteria:
        sqlArgs = {"criteria": criteria}
        sql = SqlSecurity.get_clients_on_criteria
        res = await exec_sql(sql=sql, sqlArgs=sqlArgs)
        return JSONResponse(content=res)
    else:
        return JSONResponse(content=[])


async def login_helper(clientId, username, password):
    """
    returns access token along with user details. Raises exception if user does not exist
    """
    try:
        if (not username) or (not password):
            raise AppHttpException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                error_code="e1003",
                message=Messages.err_missing_username_password,
            )
        bundle = get_super_admin_bundle(username, password)
        if bundle is None:
            bundle = await get_other_user_bundle(clientId, username, password)
        if bundle is None:
            raise AppHttpException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                error_code="e1004",
                message=Messages.err_invalid_username_or_password,
            )
        return bundle
    except AppHttpException as e:
        raise e
    except Exception as e:
        raise AppHttpException(
            status_code=status.HTTP_401_UNAUTHORIZED, error_code="e1004", 
            message=str(e)
        )


# Helper support functions


def get_bundle(user: UserClass | SuperAdminUserClass):
    accessToken = create_access_token(
        {"userName": user.userDetails.userName}
    )
    return {"accessToken": accessToken, "payload": user}


async def get_other_user_bundle(clientId, uidOrEmail: str, password: str):
    bundle = None
    details: list = await exec_sql(
        sql=SqlSecurity.get_user_details,
        sqlArgs={"uidOrEmail": uidOrEmail, "clientId": clientId},
    )

    if details:
        jsonResultDict = details[0]["jsonResult"]
        userDetails = jsonResultDict.get("userDetails")
        if userDetails is None:
            raise AppHttpException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                error_code="e1007",
                message=Messages.err_invalid_username_or_email,
            )

        userType = userDetails.get("userType")
        isUserActive = userDetails.get("isUserActive")
        if not isUserActive:
            raise AppHttpException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                error_code="e1008",
                message=Messages.err_inactive_user,
            )
        hash = userDetails.get("hash")
        isPwdVerified = verify_password(password, hash)
        if not isPwdVerified:
            raise AppHttpException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                error_code="e1009",
                message=Messages.err_invalid_password,
            )

        user = UserClass(
            allBusinessUnits=jsonResultDict.get("allBusinessUnits"),
            allSecuredControls=jsonResultDict.get("allSecuredControls"),
            role=jsonResultDict.get("role"),
            userBusinessUnits=jsonResultDict.get("userBusinessUnits"),
            userDetails=userDetails,
            userSecuredControls=jsonResultDict.get("userSecuredControls"),
        )

        bundle = get_bundle(user)
    return bundle


def get_reset_link(request: Request, clientId, email: str):
    jwtToken = create_jwt_token(60, {"clientId": clientId, "email": email})
    baseUrl = str(request.base_url)
    jwtToken = base64.b64encode(jwtToken.encode("utf-8")).decode(
        "utf-8"
    )  # convert to base64, otherwise email is treated as spam
    resetLink = f"{baseUrl}reset-password/{jwtToken}"
    return resetLink


def get_super_admin_bundle(uidOrEmail: str, password: str):
    bundle = None
    superAdminUserName, superAdminEmail, superAdminMobile, superAdminHash = (
        get_super_admin_details_from_config()
    )
    if (uidOrEmail == superAdminUserName) or (uidOrEmail == superAdminEmail):
        isValidSuperAdmin = verify_password(
            password=password, hash=superAdminHash)
        if isValidSuperAdmin:
            superAdminUser = SuperAdminUserClass(
                userDetails={
                    "userName": superAdminUserName,
                    "userEmail": superAdminEmail,
                    "mobileNo": superAdminMobile,
                    "userType": "S",
                }
            )
            bundle = get_bundle(superAdminUser)
    return bundle


def get_super_admin_details_from_config():
    try:
        superAdminUserName = Config.SUPER_ADMIN_UID
        superAdminEmail = Config.SUPER_ADMIN_EMAIL
        superAdminMobile = Config.SUPER_ADMIN_MOBILE_NO
        superAdminHash = Config.SUPER_ADMIN_HASH
        return superAdminUserName, superAdminEmail, superAdminMobile, superAdminHash
    except Exception:
        raise AppHttpException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            error_code="e1004",
            message=Messages.err_internal_server_error,
        )