from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.config import settings

usr = settings.mail_user_name
mail_conf = ConnectionConfig(
    MAIL_USERNAME=settings.mail_user_name,
    MAIL_PASSWORD=settings.mail_password.get_secret_value(),
    MAIL_FROM=settings.mail_from,
    MAIL_PORT=settings.mail_port,
    MAIL_SERVER=settings.mail_server,

    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=False
)


async def send_email(subject: str = 'Test', body: str = 'Test body', recipients: list[str] = ['capitalch@gmail.com']):
    # body = f'<html><p>This is a paragraph</p><button>My button</button> </html>'
    message = MessageSchema(subject=subject, body=body,
                            recipients=recipients, subtype=MessageType.html,)

    fm = FastMail(mail_conf)
    await fm.send_message(message)
    return {"message": "Email sent successfully"}