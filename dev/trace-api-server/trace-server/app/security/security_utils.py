import bcrypt, jwt
from app.config import Config
from datetime import datetime, timedelta, timezone

# passwordContext = CryptContext(schemes=['bcrypt'], deprecated='auto')
ACCESS_TOKEN_EXPIRE_HOURS = Config.ACCESS_TOKEN_EXPIRE_HOURS
ALGORITHM = Config.ALGORITHM
ACCESS_TOKEN_SECRET_KEY = Config.ACCESS_TOKEN_SECRET_KEY
ACCESS_TOKEN_EXPIRE_SECONDS_TEST = Config.ACCESS_TOKEN_EXPIRE_SECONDS_TEST


def create_access_token(subject: dict) -> str:
    expiresDelta1 = datetime.utcnow() + timedelta(hours=int(ACCESS_TOKEN_EXPIRE_HOURS)) # deprecated
    expiresDelta = datetime.now(timezone.utc) + timedelta(hours=int(ACCESS_TOKEN_EXPIRE_HOURS))
    toEncode = {
        "exp": expiresDelta,
        "sub": subject
    }
    encodedJwt = jwt.encode(toEncode, ACCESS_TOKEN_SECRET_KEY, ALGORITHM)
    return (encodedJwt)


def verify_password(password, hash):
    bytes = password.encode('utf-8')
    hash1 = hash.encode('utf-8')
    ret = False
    if (bcrypt.checkpw(bytes, hash1)):
        ret = True
    return (ret)
