from fastapi import status, Request
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.dependencies import AppHttpException, UserClass
from app.messages import Messages
from app.config import Config
from app.security.security_utils import create_access_token, verify_password
from app.graphql.db.sql_security import SqlSecurity
from app.graphql.db.helpers.psycopg_async_helper import exec_sql


async def login_clients_helper(request: Request):
    body = await request.json()
    criteria = body.get("criteria")

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
            status_code=status.HTTP_401_UNAUTHORIZED, error_code="e1004", message=str(e)
        )


# Helper support functions


def get_bundle(user: UserClass):
    accessToken = create_access_token({"userName": user.userName})
    return {"accessToken": accessToken, "payload": user}


async def get_other_user_bundle(clientId, uidOrEmail: str, password: str):
    bundle = None
    # Do modifications for clientId
    details: list = await exec_sql(
        sql=SqlSecurity.get_user_details,
        sqlArgs={"uidOrEmail": uidOrEmail, "clientId": clientId},
    )

    if details:
        jsonResultDict = details[0]["jsonResult"]
        userDetails = jsonResultDict.get("userDetails")
        businessUnits = jsonResultDict.get("businessUnits")
        role = jsonResultDict.get("role")
        if userDetails is None:
            raise AppHttpException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                error_code="e1007",
                message=Messages.err_invalid_username_or_email,
            )

        userType = userDetails.get("userType")
        isActive = userDetails.get("isUserActive")
        if not isActive:
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
            userType=userType,
            businessUnits=businessUnits,
            clientCode=userDetails["clientCode"],
            clientName=userDetails["clientName"],
            clientId=userDetails["clientId"],
            dbName=userDetails["dbName"],
            dbParams=userDetails["dbParams"],
            email=userDetails["userEmail"],
            isClientActive=userDetails["isClientActive"],
            isUserActive=userDetails["isUserActive"],
            isExternalDb=userDetails["isExternalDb"],
            lastUsedBranchId=userDetails["lastUsedBranchId"],
            lastUsedBuId=userDetails["lastUsedBuId"],
            mobileNo=userDetails["mobileNo"],
            role=role,
            uid=userDetails["uid"],
            userName=userDetails["userName"],
            id=userDetails["id"],
        )
        bundle = get_bundle(user)
    return bundle


def get_super_admin_bundle(uidOrEmail: str, password: str):
    bundle = None
    superAdminUserName, superAdminEmail, superAdminMobile, superAdminHash = (
        get_super_admin_details_from_config()
    )
    if (uidOrEmail == superAdminUserName) or (uidOrEmail == superAdminEmail):
        isValidSuperAdmin = verify_password(password=password, hash=superAdminHash)
        if isValidSuperAdmin:
            user = UserClass(
                userName=superAdminUserName,
                email=superAdminEmail,
                mobileNo=superAdminMobile,
                userType="S",
            )
            bundle = get_bundle(user)
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
