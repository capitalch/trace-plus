from app.vendors import Depends, OAuth2PasswordBearer, OAuth2PasswordRequestForm, status
from app.dependencies import AppHttpException
from app.messages import Messages
from app.config import Config
# from typing import Annotated
# from pydantic import BaseModel

def login_helper(formData=Depends(OAuth2PasswordRequestForm)):
    '''
        returns access token along with user details. Raises exception if user does not exist
    '''
    username = formData.username.strip()
    password = formData.password.strip()
    if((not username) or (not password) ):
        raise AppHttpException(status_code=status.HTTP_401_UNAUTHORIZED, error_code='e1003',message=Messages.err_missing_username_password)
    superAdminUserName, superAdminEmail, sperAdminMobile, superAdminHash = get_sper_admin_details_from_config()
    if((username == superAdminUserName) or (username == superAdminEmail)):
        pass
    bundle = {"accessToken": f'{username}:{password}'}
    return(bundle)

## Helper support functions
def get_super_admin_bundle(username:str, password: str):
    pass
    
def get_sper_admin_details_from_config():
    try:
        superAdminUserName = Config.SUPER_ADMIN_USERNAME
        superAdminEmail = Config.SUPER_ADMIN_EMAIL
        superAdminMobile = Config.SUPER_ADMIN_MOBILE_NO
        superAdminHash = Config.SUPER_ADMIN_HASH
        return superAdminUserName, superAdminEmail, superAdminMobile, superAdminHash
    except Exception:
        raise AppHttpException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, error_code='e1004',message=Messages.err_super_admin_user_config_data_missing)