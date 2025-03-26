from flask import Flask, render_template, request
from flask_bcrypt import Bcrypt
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import random
from otp_sender import Otp_sender
import secrets
from flask import jsonify

# Load environment variables
load_dotenv()

app = Flask(__name__)
bcrypt = Bcrypt(app)

# Get Supabase credentials from .env
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

otp_storage = {}
session_tokens = {}

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/student")
def student():
    return "<h1>Welcome, Advait Amit Desai!</h1>"

@app.route("/teacher_login", methods=["GET", "POST"])
def teacher_login():
    if request.method == "POST":
        email = request.form.get("email")
        otp = request.form.get("otp")

        # verify otp
        if otp:
            entered_otp = int(otp)
            if email in otp_storage and otp_storage[email] == entered_otp:
                del otp_storage[email] # delete otp after login

                # generate session token
                session_tokens[email] = secrets.token_hex(16)

                return jsonify({"success": True, "message": "Login Successful", "session_token": session_tokens[email]})
            else:
                return jsonify({"success": False, "message": "Invalid OTP"}), 401

        # send otp
        response = supabase.table("teachers").select("*").eq("email", email).execute()
        
        if response.data:
            generated_otp = random.randint(100000, 999999)
            otp_storage[email] = generated_otp
            
            Otp_sender(email, generated_otp).send_email()
            
            return render_template("teacher_login.html", email=email, otp_sent=True)
        else:
            return "<h1>Teacher not found</h1>", 404

    return render_template("teacher_login.html", otp_sent=False)

if __name__ == "__main__":
    app.run(debug=True)