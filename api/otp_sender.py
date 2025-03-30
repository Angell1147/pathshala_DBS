import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import os
import certifi
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

class Otp_sender:
    def __init__(self, recipient, otp):
        self.EMAIL_ADDRESS = "starfishkid.brawlstars@gmail.com"
        self.EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
        if not self.EMAIL_PASSWORD:
            logger.error("EMAIL_PASSWORD environment variable not found!")
        self.SMTP_SERVER = "smtp.gmail.com"
        self.SMTP_PORT = 587  # TLS Port
        self.otp = otp
        self.receiver_email = recipient
    
    def send_email(self):
        try:
            receiver_email = self.receiver_email
            subject = "OTP for Pathshala DBS"
            body = f"Your OTP is: {self.otp}"
            logger.info(f"Preparing to send OTP {self.otp} to {receiver_email}")
            
            # Create email message
            msg = MIMEMultipart()
            msg["From"] = self.EMAIL_ADDRESS
            msg["To"] = receiver_email
            msg["Subject"] = subject
            msg.attach(MIMEText(body, "plain"))
            
            # Send email using SMTP
            logger.info(f"Connecting to SMTP server {self.SMTP_SERVER}:{self.SMTP_PORT}")
            context = ssl.create_default_context(cafile=certifi.where())
            
            with smtplib.SMTP(self.SMTP_SERVER, self.SMTP_PORT) as server:
                logger.info("Starting TLS")
                server.starttls(context=context)
                logger.info(f"Logging in with {self.EMAIL_ADDRESS}")
                server.login(self.EMAIL_ADDRESS, self.EMAIL_PASSWORD)
                logger.info(f"Sending email to {receiver_email}")
                server.sendmail(self.EMAIL_ADDRESS, receiver_email, msg.as_string())
                logger.info("Email sent successfully")
                return True
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            raise