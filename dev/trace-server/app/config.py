"""Application configuration — one model, the single source of truth.

Values come from `dev/trace-server/.env`, which is git-ignored and never leaves this
machine. Every field here is either a development-safe default or, for a secret, has no
default at all — so the server refuses to start rather than run on a placeholder.

`.env.example` and `scripts/check_settings.py` are both derived from this model. After
adding, removing or renaming a field, regenerate the template and commit it:

    python scripts/gen_env_example.py
"""

from pathlib import Path

from pydantic import EmailStr, Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# app/config.py -> dev/trace-server. Anchored deliberately: `env_file=".env"` resolves
# against the current working directory, so the server would find its .env only when
# launched from this folder.
SERVER_DIR = Path(__file__).resolve().parents[1]

# What gen_env_example.py writes into .env.example for every key that must be filled in.
# Rejected below, so a copied-but-unedited .env cannot start the server.
PLACEHOLDER = "changeme"


class Settings(BaseSettings):
    """Every configuration value the server reads, loaded from .env.

    Secrets are typed `SecretStr`: they render as `**********` in `repr`, `str`,
    f-strings and log output, so an accidental `print(settings)` or a debug traceback
    cannot leak one. Read them deliberately with `.get_secret_value()`.

    Non-secret defaults are development-safe — `localhost` rather than a live host — so a
    fresh clone with no .env can never reach production infrastructure by accident.
    """

    model_config = SettingsConfigDict(
        env_file=SERVER_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # application
    app_env: str = Field(default="development", description="Runtime environment: development or production")
    package_name: str = Field(default="Trace+ accounting", description="Application name")

    # super admin
    super_admin_email: EmailStr = Field(default="admin@example.com", description="Super admin email address")
    super_admin_hash: SecretStr = Field(description="Super admin password hash")
    super_admin_mobile_no: str = Field(default="98888888888", description="Super admin mobile number")
    super_admin_uid: str = Field(default="superAdmin", description="Super admin user id")

    # jwt
    access_token_expire_hours: int = Field(default=24, ge=1, description="Access token lifetime in hours")
    access_token_expire_seconds_test: int = Field(default=10, ge=1, description="Access token lifetime in seconds, tests only")
    access_token_secret_key: SecretStr = Field(description="Signing key for access tokens")
    algorithm: str = Field(default="HS256", description="JWT signing algorithm")

    # database (security database)
    db_host: str = Field(default="localhost", description="Database host name")
    db_internal_port: int = Field(default=5432, ge=1, le=65535, description="Database port inside the private network")
    db_ip_address: str = Field(default="127.0.0.1", description="Database IP address")
    db_name: str = Field(default="traceAuth", description="Security database name")
    db_password: SecretStr = Field(description="Database password")
    db_port: int = Field(default=5432, ge=1, le=65535, description="Database port")
    db_user: str = Field(default="webadmin", description="Database user")

    # crypto
    crypto_key: SecretStr = Field(description="Symmetric key used by app/core/utils.py")

    # mail
    mail_from: EmailStr = Field(default="admin@example.com", description="From address on outgoing mail")
    mail_password: SecretStr = Field(description="SMTP password")
    mail_port: int = Field(default=587, ge=1, le=65535, description="SMTP port")
    mail_server: str = Field(default="localhost", description="SMTP host name")
    mail_user_name: str = Field(default="admin@example.com", description="SMTP user name")

    # integration — this value must equal trace_plus_service_key in service-plus
    service_plus_api_key: SecretStr = Field(
        description="Pre-shared key for service-plus internal calls, sent as the X-Service-Key header"
    )

    @field_validator("*", mode="after")
    @classmethod
    def reject_placeholder(cls, v, info):
        """A .env copied from the template but never filled in must not start the server.

        Without this the app would come up with `changeme` as its signing key or database
        password — running, apparently healthy, and completely insecure.
        """
        raw = v.get_secret_value() if isinstance(v, SecretStr) else v
        if isinstance(raw, str) and raw.strip().lower() == PLACEHOLDER:
            raise ValueError(f"{info.field_name} still holds the .env.example placeholder")
        return v


settings = Settings()
