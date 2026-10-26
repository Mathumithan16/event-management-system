
import os
from email.message import EmailMessage

import aiosmtplib
from dotenv import load_dotenv

load_dotenv()


async def send_otp_email(to_email: str, otp: str) -> None:
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_APP_PASSWORD")
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))

    if not smtp_email or not smtp_password:
        raise RuntimeError(
            "SMTP_EMAIL and SMTP_APP_PASSWORD must be configured in .env"
        )

    message = EmailMessage()
    message["Subject"] = "Verify your Event Management account"
    message["From"] = smtp_email
    message["To"] = to_email

    message.set_content(
        f"""Hello,

Your Event Management System verification code is: {otp}

This code expires in 10 minutes.

If you did not request this code, you can ignore this email.

Thank you,
Event Management System
"""
    )

    await aiosmtplib.send(
        message,
        hostname=smtp_host,
        port=smtp_port,
        start_tls=True,
        username=smtp_email,
        password=smtp_password,
        timeout=20,
    )
