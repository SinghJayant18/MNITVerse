import random
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings


def generate_otp() -> str:
    """Generate a 6-digit OTP."""
    return str(random.randint(100000, 999999))


def send_verification_email(to_email: str, otp_code: str, name: str = "Student") -> bool:
    """Send an OTP verification email using SMTP.

    Returns True if the email was sent successfully, False otherwise.
    """
    is_placeholder = "YOUR_EMAIL_HERE" in settings.smtp_user or "YOUR_GMAIL_APP_PASSWORD" in settings.smtp_password
    if not settings.smtp_user or not settings.smtp_password or is_placeholder:
        print(f"\n=======================================================")
        print(f"🔑 [DEV MODE] MNITVerse OTP Verification Code for {to_email}: {otp_code}")
        print(f"=======================================================\n")
        return True  # Fallback to dev mode: allow registration to proceed

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background-color:#0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width:480px; margin:40px auto; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius:24px; border:1px solid rgba(255,255,255,0.1); overflow:hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #f97316, #ec4899); padding:32px 24px; text-align:center;">
                <h1 style="margin:0; color:#fff; font-size:24px; font-weight:800; letter-spacing:-0.5px;">
                    🎓 MNITVerse
                </h1>
                <p style="margin:8px 0 0; color:rgba(255,255,255,0.85); font-size:14px;">
                    Email Verification
                </p>
            </div>

            <!-- Body -->
            <div style="padding:32px 24px;">
                <p style="color:#f1f5f9; font-size:15px; margin:0 0 16px; line-height:1.6;">
                    Hi {name},
                </p>
                <p style="color:#f1f5f9; font-size:15px; margin:0 0 24px; line-height:1.6;">
                    Use the verification code below to complete your registration on MNITVerse:
                </p>

                <!-- OTP Box -->
                <div style="background:rgba(249,115,22,0.1); border:2px solid rgba(249,115,22,0.3); border-radius:16px; padding:24px; text-align:center; margin:0 0 24px;">
                    <p style="margin:0 0 8px; color:#f1f5f9; font-size:12px; text-transform:uppercase; letter-spacing:2px; font-weight:600;">
                        Your Verification Code
                    </p>
                    <p style="margin:0; color:#f97316; font-size:36px; font-weight:800; letter-spacing:8px; font-family:monospace;">
                        {otp_code}
                    </p>
                </div>

                <p style="color:#f1f5f9; font-size:13px; margin:0 0 8px; line-height:1.5;">
                    ⏰ This code expires in 10 minutes.
                </p>
                <p style="color:#94a3b8; font-size:13px; margin:0; line-height:1.5;">
                    If you didn't request this, you can safely ignore this email.
                </p>
            </div>

            <!-- Footer -->
            <div style="padding:20px 24px; border-top:1px solid rgba(255,255,255,0.05); text-align:center;">
                <p style="margin:0; color:#475569; font-size:11px;">
                    © MNITVerse · MNIT Jaipur · Built with ❤️
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🔐 MNITVerse Verification Code: {otp_code}"
        sender_name = "MNITVERSE"
        sender_email = settings.smtp_from_email or settings.smtp_user
        msg["From"] = f'"{sender_name}" <{sender_email}>'
        msg["To"] = to_email

        # Plain-text fallback
        text_body = (
            f"Hi {name},\n\n"
            f"Your MNITVerse verification code is: {otp_code}\n\n"
            f"This code expires in 10 minutes.\n"
            f"If you didn't request this, please ignore this email.\n\n"
            f"— MNITVerse Team"
        )
        msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(msg["From"], [to_email], msg.as_string())

        print(f"[EMAIL] Verification email sent to {to_email}")
        return True

    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send to {to_email}: {e}")
        return False
