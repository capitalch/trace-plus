from app.vendors import Depends, OAuth2PasswordBearer, OAuth2PasswordRequestForm, status
from app.dependencies import AppHttpException, UserClass
from app.messages import Messages
from app.config import Config
from app.security.security_utils import create_access_token, verify_password
from app.graphql.db import exec_sql_asyncpg as exec_sql
from app.graphql.db.sql_security import SqlSerurity
# from app.graphql.db import exec_sql_psycopg2 as exec_sql
# from app.graphql.db import exec_sql_psycopg_async as exec_sql


async def login_helper(formData=Depends(OAuth2PasswordRequestForm)):
    '''
        returns access token along with user details. Raises exception if user does not exist
    '''
    try:
        username = formData.username.strip()
        password = formData.password.strip()
        if ((not username) or (not password)):
            raise AppHttpException(status_code=status.HTTP_401_UNAUTHORIZED,
                                   error_code='e1003', message=Messages.err_missing_username_password)
        bundle = get_super_admin_bundle(username, password)
        if bundle is None:
            bundle = await get_other_user_bundle(username, password)
        if (bundle is None):
            raise AppHttpException(status_code=status.HTTP_401_UNAUTHORIZED,
                                   error_code='e1004', message=Messages.err_invalid_username_or_password)
        return (bundle)
    except AppHttpException:
        raise
    except Exception as e:
        print(e)
        raise AppHttpException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, error_code='', message=str(e))

# Helper support functions


def get_bundle(user: UserClass):
    accessToken = create_access_token({'userName': user.userName})
    return ({
        'accessToken': accessToken,
        'payload': user
    })


async def get_other_user_bundle(uidOrEmail: str, password: str):
    details: list = await exec_sql(sql=SqlSerurity.get_user_details, sqlArgs={
                             'uidOrEmail': uidOrEmail},)
    if(details):
        jsonResultDict = details[0]['jsonResult']
    
    return('abcd')


def get_super_admin_bundle(uidOrEmail: str, password: str):
    bundle = None
    superAdminUserName, superAdminEmail, superAdminMobile, superAdminHash = get_super_admin_details_from_config()
    if ((uidOrEmail == superAdminUserName) or (uidOrEmail == superAdminEmail)):
        isValidSuperAdmin = verify_password(
            password=password, hash=superAdminHash)
        if (isValidSuperAdmin):
            user = UserClass(userName=superAdminUserName, email=superAdminEmail,
                             mobileNo=superAdminMobile, userType='S')
            bundle = get_bundle(user)
    return (bundle)


def get_super_admin_details_from_config():
    try:
        superAdminUserName = Config.SUPER_ADMIN_USERNAME
        superAdminEmail = Config.SUPER_ADMIN_EMAIL
        superAdminMobile = Config.SUPER_ADMIN_MOBILE_NO
        superAdminHash = Config.SUPER_ADMIN_HASH
        return superAdminUserName, superAdminEmail, superAdminMobile, superAdminHash
    except Exception:
        raise AppHttpException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                               error_code='e1004', message=Messages.err_super_admin_user_config_data_missing)
