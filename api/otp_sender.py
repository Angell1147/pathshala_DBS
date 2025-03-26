import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import os
load_dotenv()

class Otp_sender:
    def __init__(self, recipient, otp):
        self.EMAIL_ADDRESS = "starfishkid.brawlstars@gmail.com"
        self.EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
        self.SMTP_SERVER = "smtp.gmail.com"
        self.SMTP_PORT = 587  # TLS Port
        self.otp = otp
        self.receiver_email = recipient
    
    def send_email(self):
        receiver_email = self.receiver_email
        subject = "OTP for Pathshala DBS"
        body = f"Your OTP is: {self.otp}"
        
        # Create email message
        msg = MIMEMultipart()
        msg["From"] = self.EMAIL_ADDRESS
        msg["To"] = receiver_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))
        
        # Send email using SMTP
        context = ssl.create_default_context()
        with smtplib.SMTP(self.SMTP_SERVER, self.SMTP_PORT) as server:
            server.starttls(context=context)
            server.login(self.EMAIL_ADDRESS, self.EMAIL_PASSWORD)
            server.sendmail(self.EMAIL_ADDRESS, receiver_email, msg.as_string())
            print("email sent successfully")
