import bcrypt, jwt, logging
from fastapi import Request, status
from app.config import Config
from app.messages import Messages
from app.dependencies import AppHttpException
from datetime import datetime, timedelta, timezone
from jwt.exceptions import (
    ExpiredSignatureError,
    InvalidSignatureError,
    InvalidTokenError,
)

ACCESS_TOKEN_EXPIRE_HOURS = Config.ACCESS_TOKEN_EXPIRE_HOURS
ALGORITHM = Config.ALGORITHM
ACCESS_TOKEN_SECRET_KEY = Config.ACCESS_TOKEN_SECRET_KEY
ACCESS_TOKEN_EXPIRE_SECONDS_TEST = Config.ACCESS_TOKEN_EXPIRE_SECONDS_TEST


def create_access_token(subject: dict) -> str:
    expiresDelta = datetime.now(timezone.utc) + timedelta(
        hours=int(ACCESS_TOKEN_EXPIRE_HOURS)
    )
    toEncode = {"exp": expiresDelta, "sub": subject}
    encodedJwt = jwt.encode(toEncode, ACCESS_TOKEN_SECRET_KEY, ALGORITHM)
    return encodedJwt


def verify_password(password, hash):
    bytes = password.encode("utf-8")
    hash1 = hash.encode("utf-8")
    ret = False
    if bcrypt.checkpw(bytes, hash1):
        ret = True
    return ret


async def validate_token(request: Request):
    try:
        err = None
        auth: str = request.headers.get("Authorization", None)
        if auth:
            token = auth.split()[1].strip()
            jwt.decode(token, ACCESS_TOKEN_SECRET_KEY, algorithms=ALGORITHM)
    except ExpiredSignatureError as e:
        logging.error(e)
        raise AppHttpException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code='e1011',
            message=Messages.err_access_token_signature_expired
        )
    except InvalidSignatureError as e:
        logging.error(e)
        # raise AppHttpException(
        #     detail=Messages.err_access_token_signature_invalid, status_code=status.HTTP_401_UNAUTHORIZED, error_code='e1014'
        # )
    except InvalidTokenError as e:
        logging.error(e)
        # raise AppHttpException(
        #     detail=Messages.err_access_token_invalid, status_code=status.HTTP_401_UNAUTHORIZED, error_code='e1015'
        # )
    except Exception as e:
        logging.error(e)
        # raise AppHttpException(
        #     detail=Messages.err_access_token_invalid, status_code=status.HTTP_401_UNAUTHORIZED, error_code='e1015'
        # )
