import bcrypt
import jwt
import logging
from fastapi import Request, status
from app.config import Config
from app.core.messages import Messages
from app.core.dependencies import AppHttpException
from datetime import datetime, timedelta, timezone
from jwt.exceptions import (
    ExpiredSignatureError,
    InvalidSignatureError,
    InvalidTokenError,
)
import random
import string

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


def create_jwt_token(expireMinutes: int, data: dict) -> str:
    expiresDelta = datetime.now() + timedelta(minutes=expireMinutes)
    toEncode = {
        "exp": expiresDelta, "data": data
    }
    encodedJwt = jwt.encode(toEncode, ACCESS_TOKEN_SECRET_KEY, ALGORITHM)
    return (encodedJwt)


def getPasswordHash(pwd):
    interm = pwd.encode('utf-8')
    salt = bcrypt.gensalt(rounds=12)
    pwdHash = bcrypt.hashpw(interm, salt).decode('utf-8')
    return pwdHash


def getRandomPassword():
    rnd = f'@A1{randomStringGenerator(9, (string.ascii_letters + string.punctuation + string.digits))}b'
    # Remove all instances of ':' since clint sends credentials as 'uid:pwd'
    return (rnd.replace(':', '$'))


def getRandomUserId():
    rnd = randomStringGenerator(8, string.ascii_letters + string.digits)
    # Remove all instances of ':' since clint sends credentials as 'uid:pwd'
    return (rnd.replace(':', '$'))


def verify_password(password, hash):
    bytes = password.encode("utf-8")
    hash1 = hash.encode("utf-8")
    ret = False
    if bcrypt.checkpw(bytes, hash1):
        ret = True
    return ret


def parse_bearer_token(s):
    if (not s) or (not s.strip()):
        return None
    if s.startswith("Bearer "):
        return s[len("Bearer "):].strip()
    return s


async def validate_token(request: Request):
    try:
        auth: str = request.headers.get("Authorization", None)
        token = parse_bearer_token(auth)
        if (token is None) or (token == ""):
            raise AppHttpException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                error_code="e1015",
                message=Messages.err_access_token_missing,
            )
        else:
            token = auth.split()[1].strip()  # Need checkup of this line
            jwt.decode(token, ACCESS_TOKEN_SECRET_KEY, algorithms=ALGORITHM)
            print("success")
    except ExpiredSignatureError as e:
        logging.error(e)
        raise AppHttpException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="e1011",
            message=Messages.err_access_token_signature_expired,
        )
    except InvalidSignatureError as e:
        logging.error(e)
        raise AppHttpException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="e1012",
            message=Messages.err_access_token_signature_invalid,
        )
    except InvalidTokenError as e:
        logging.error(e)
        raise AppHttpException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="e1013",
            message=Messages.err_access_token_invalid,
        )
    except AppHttpException as e:
        raise e
    except Exception as e:
        logging.error(e)
        message = getattr(e, 'args')[0] if getattr(
            e, 'args', None) else Messages.err_access_token_unknown_error 
        raise AppHttpException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="e1014",
            message=message,
        )


def randomStringGenerator(strSize, allowedChars):
    return ''.join(random.choice(allowedChars) for x in range(strSize))
