class Config:
    # main
    PACKAGE_NAME = 'Trace+ Accounting'
    
    # Crypto
    CRYPTO_KEY = ''
    
    # super admin
    SUPER_ADMIN_USERNAME = 'superAdmin'
    SUPER_ADMIN_EMAIL = 'capitalch@gmail.com'
    # SUPER_ADMIN_HASH = '$2a$12$vFDWBBMF8AlpLxec7yptK.VC/942A0OPLLMWF1NG.0Hat3vatsEBi'
    SUPER_ADMIN_HASH = '$2b$12$M.YYKJlGHC.WmahbmNSiweftqXXvi/oy13vMTZ.8zEXEeyIAA1DCe'
    SUPER_ADMIN_MOBILE_NO = '98888888888'

    comment: str = 'speradmin pwd is superadmin@123'

    # jwt
    ACCESS_TOKEN_SECRET_KEY = 'qfU/9V5G0PtSVkfD6iQjtXEduNTMXkjLQpbyNhnUUy00tMcw149LMyLA+1qim1yW'
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS = '10'
    ACCESS_TOKEN_EXPIRE_SECONDS_TEST = '20'