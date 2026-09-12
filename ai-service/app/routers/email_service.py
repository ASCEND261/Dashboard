import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import urllib.request
import json

from app.config import settings

logger = logging.getLogger("ascend.email")
router = APIRouter(prefix="/email", tags=["Email"])

class SendOtpRequest(BaseModel):
    email: str
    otp: str
    name: Optional[str] = None

@router.post("/send-otp")
async def send_otp(req: SendOtpRequest):
    """
    Dispatches a 6-digit security verification OTP to the user's email.
    Supports standard SMTP (Gmail App Password, Brevo, AWS SES, Outlook) and Resend API.
    """
    recipient = req.email.strip().lower()
    otp_code = req.otp.strip()
    name = req.name or recipient.split("@")[0].capitalize()

    subject = f"ASCEND Security Verification Passcode: {otp_code}"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ASCEND Security Verification</title>
    </head>
    <body style="margin:0;padding:0;background-color:#07080A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#F4F4F5;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#07080A;padding:40px 16px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:520px;background:linear-gradient(180deg,#0D0F14 0%,#090A0D 100%);border:1px solid #1E293B;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.6);">
              
              <!-- Brand Header -->
              <tr>
                <td style="padding:32px 32px 20px 32px;text-align:center;border-bottom:1px solid #18181B;">
                  <div style="display:inline-block;padding:8px 16px;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.25);border-radius:999px;color:#60A5FA;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px;">
                    ASCEND • TECH SPRINT 2026
                  </div>
                  <h1 style="margin:0;font-size:22px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;">
                    Security Verification Passcode
                  </h1>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding:32px;">
                  <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#A1A1AA;">
                    Hello <strong style="color:#FFFFFF;">{name}</strong>,
                  </p>
                  <p style="margin:0 0 28px 0;font-size:14px;line-height:1.6;color:#A1A1AA;">
                    Use the 6-digit authoritative security passcode below to authenticate your ASCEND session and complete cohort registration:
                  </p>

                  <!-- Passcode Card -->
                  <div style="background:rgba(15,23,42,0.8);border:1px solid #2563EB;border-radius:12px;padding:24px 16px;text-align:center;margin:0 0 28px 0;">
                    <div style="font-size:10px;font-family:monospace;text-transform:uppercase;color:#60A5FA;letter-spacing:2px;margin-bottom:8px;font-weight:700;">
                      Official Single-Use Passcode
                    </div>
                    <div style="font-size:36px;font-family:SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-weight:900;letter-spacing:12px;color:#FFFFFF;text-shadow:0 0 20px rgba(96,165,250,0.5);">
                      {otp_code}
                    </div>
                    <div style="font-size:11px;color:#94A3B8;margin-top:8px;">
                      Expires in 10 minutes • Authoritative Consensus
                    </div>
                  </div>

                  <p style="margin:0;font-size:12px;line-height:1.6;color:#71717A;">
                    If you did not request this verification code, please ignore this email. Do not share this single-use passcode with anyone.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 32px;background:#050608;border-top:1px solid #18181B;text-align:center;font-size:11px;color:#52525B;">
                  ASCEND Achievement Verification & Scoring Infrastructure &copy; 2026
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """

    smtp_host = os.getenv("SMTP_HOST", "")
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_pass = os.getenv("SMTP_PASSWORD", "")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_from = os.getenv("SMTP_FROM", smtp_user or "ASCEND Security <noreply@ascend.team>")
    resend_key = os.getenv("RESEND_API_KEY", "")

    sent = False
    provider = None
    error_msg = None

    # 1. Try standard SMTP (Gmail App Password, Brevo, AWS SES, custom SMTP)
    if smtp_user and smtp_pass:
        try:
            logger.info(f"📧 [SMTP] Attempting connection to {smtp_host}:{smtp_port} for {recipient}")
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = smtp_from
            msg["To"] = recipient

            part_text = MIMEText(f"ASCEND Security Verification Code: {otp_code}\nExpires in 10 minutes.", "plain")
            part_html = MIMEText(html_body, "html")
            msg.attach(part_text)
            msg.attach(part_html)

            if smtp_port == 465:
                # SSL
                with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=10) as server:
                    server.login(smtp_user, smtp_pass)
                    server.sendmail(smtp_from, [recipient], msg.as_string())
            else:
                # STARTTLS (port 587 or 25)
                with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                    server.ehlo()
                    server.starttls()
                    server.ehlo()
                    server.login(smtp_user, smtp_pass)
                    server.sendmail(smtp_from, [recipient], msg.as_string())

            sent = True
            provider = f"SMTP ({smtp_host})"
            logger.info(f"✅ [SMTP SUCCESS] Delivered OTP code to {recipient} via {smtp_host}")
        except Exception as e:
            logger.error(f"❌ [SMTP ERROR] Failed sending via {smtp_host}: {e}")
            error_msg = str(e)

    # 2. Try Resend API if SMTP not configured or failed
    if not sent and resend_key:
        try:
            logger.info(f"📧 [RESEND] Attempting dispatch to {recipient} via Resend API")
            req_data = json.dumps({
                "from": os.getenv("RESEND_FROM", "ASCEND Security <onboarding@resend.dev>"),
                "to": [recipient],
                "subject": subject,
                "html": html_body,
            }).encode("utf-8")
            url_req = urllib.request.Request(
                "https://api.resend.com/emails",
                data=req_data,
                headers={
                    "Authorization": f"Bearer {resend_key}",
                    "Content-Type": "application/json"
                },
                method="POST"
            )
            with urllib.request.urlopen(url_req, timeout=10) as response:
                if response.status in (200, 201):
                    sent = True
                    provider = "Resend API"
                    logger.info(f"✅ [RESEND SUCCESS] Delivered OTP to {recipient}")
                else:
                    error_msg = f"Resend API status {response.status}"
        except Exception as e:
            logger.error(f"❌ [RESEND EXCEPTION] Failed sending via Resend: {e}")
            error_msg = str(e)

    if sent:
        return {
            "status": "delivered",
            "provider": provider,
            "recipient": recipient,
            "message": f"Verification code successfully sent via {provider}."
        }
    else:
        logger.warning(
            f"⚠️ [EMAIL DISPATCH NOTICE] No active SMTP or Resend credentials configured. "
            f"Passcode for {recipient}: {otp_code}. Error: {error_msg}"
        )
        return {
            "status": "pending_credentials",
            "provider": "none",
            "recipient": recipient,
            "message": "No active email credentials configured in .env. Code recorded in system logs.",
            "error": error_msg
        }
