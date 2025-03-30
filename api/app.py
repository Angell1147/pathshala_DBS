import time
from flask import Flask, jsonify, request, session
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from flask_cors import CORS
from flask_session import Session
from otp_sender import Otp_sender
import random
import secrets
import uuid
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Enable CORS for all routes
CORS(app)
# Configure Flask-Session with stronger settings
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", secrets.token_hex(32))
app.config["SESSION_TYPE"] = "redis"  # Use Redis for session storage

app.config["SESSION_PERMANENT"] = True
app.config["SESSION_USE_SIGNER"] = True
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=7)  # Token valid for 7 days
Session(app)

# Get Supabase credentials from .env
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# Store for OTPs (in-memory for development, should use Redis/database in production)
otp_storage = {}

# Store for session tokens (in-memory for development, should use Redis/database in production)
session_tokens = {}

@app.route("/")
def hello_world():
    return "<p>Hello, World! My name is Soham Margaj</p>"

@app.route('/time')
def get_current_time():
    return {'time': time.time(), 'message': os.getenv('FLASK_APP')}

@app.route("/Batches", methods=["GET"])
def get_free_time_slots_batch():
    # Verify session token
    # if not verify_session_token(request):
        # return jsonify({"error": "Unauthorized"}), 401
        
    response = supabase.rpc("batches").execute()
    if response.data:
        return jsonify(response.data)
    else:
        return jsonify({"error": "No data found or function error"}), 400

@app.route('/allTimeSlots')
def get_all_time_slots():
    # Verify session token
    # if not verify_session_token(request):
        # return jsonify({"error": "Unauthorized"}), 401
        
    # Call the stored function in Supabase
    response = supabase.rpc("get_custom_users").execute()
    if response.data:
        return jsonify(response.data)
    else:
        return jsonify({"error": "No data found or function error"}), 400
    
@app.route("/Classroom", methods=["GET"])
def get_free_time_slots():
    # Verify session token
    # if not verify_session_token(request):
        # return jsonify({"error": "Unauthorized"}), 401
        
    # Call the `get_free_time_slots()` function from Supabase
    response = supabase.rpc("get_free_time_slots_for_classrooms").execute()
    if response.data:
        return jsonify(response.data)
    else:
        return jsonify({"error": "No data found or function error"}), 400

@app.route("/otp_generator", methods=["POST"])
def generate_otp():
    if not request.is_json:
        return jsonify({"error": "Invalid JSON"}), 400
    
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    # Check if email exists in Supabase
    try:
        response = supabase.rpc("get_teacher", {"email": email}).execute()
    except Exception as e:
        return jsonify({"error": f"Supabase error: {str(e)}"}), 500
    
    if not response.data:
        return jsonify({"error": "Email is not authenticated"}), 400
    
    generated_otp = random.randint(100000, 999999)
    otp_storage[email] = "123456"
    
    try:
        # otp_sender = Otp_sender(email, generated_otp)
        # otp_sender.send_email()
        return jsonify({"success": True, "message": "OTP sent successfully"})
    except Exception as e:
        app.logger.error(f"Error sending OTP: {str(e)}")
        return jsonify({"error": f"Failed to send OTP: {str(e)}"}), 500

@app.route("/teacher_login", methods=["POST"])
def teacher_login():
    if not request.is_json:
        return jsonify({"error": "Invalid JSON"}), 400

    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')

    if not email:
        return jsonify({"error": "Email is required"}), 400
    if not otp: 
        return jsonify({"error": "OTP is required"}), 400

    # Validate OTP
    if email in otp_storage and int(otp_storage[email]) == int(otp):
        del otp_storage[email]  # Remove OTP after successful verification

        # Fetch teacher details from Supabase
        response = supabase.rpc("get_teacher", {"email": email}).execute()
        if not response.data:
            return jsonify({"error": "Teacher not found"}), 400

        teacher_id = response.data[0]["id"]
        
        # Generate a secure session token
        session_token = generate_session_token(teacher_id, email)
        
        # Return the session token to the client
        return jsonify({
            "success": True, 
            "message": "Login Successful", 
            "session_token": session_token
        })
    
    return jsonify({"success": False, "message": "Invalid Email or OTP"}), 401

@app.route("/teacher_profile", methods=["POST"])
def teacher_profile():
    # Verify the session token
    session_data = verify_session_token(request)
    if not session_data:
        return jsonify({"error": "Unauthorized"}), 401
    
    # Return teacher profile information
    return jsonify({
        "success": True,
        "teacher_id": session_data["teacher_id"],
        "email": session_data["email"]
    })

@app.route("/logout", methods=["POST"])
def logout():
    # Get the session token from request
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        
        # Remove the token from our session tokens storage
        if token in session_tokens:
            del session_tokens[token]
            
    return jsonify({"success": True, "message": "Logged out successfully"})


def generate_session_token(teacher_id, email):
    """Generate a secure session token and store session information"""
    # Generate a random token
    token = secrets.token_hex(32)
    
    # Store token with user information and expiration time
    session_tokens[token] = {
        "teacher_id": teacher_id,
        "email": email,
        "created_at": datetime.now(),
        "expires_at": datetime.now() + timedelta(days=7)  # Token valid for 7 days
    }
    
    return token


@app.route("/verify_session", methods=["POST"])
def verify_session():
    # Verify the session token
    session_data = verify_session_token(request)
    if not session_data:
        return jsonify({"error": "Unauthorized"}), 401
    
    # Return success message
    return jsonify({"success": True, "message": "Session is valid"})



def verify_session_token(request):
    """Verify if the session token is valid"""
    auth_header = request.headers.get('Authorization')
    
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    print("token", token)
    
    # Check if token exists and is not expired
    if token in session_tokens:
        print("Token found")
        session_data = session_tokens[token]
        if datetime.now() < session_data["expires_at"]:
            return session_data
        else:
            # Token expired, remove it
            del session_tokens[token]
    
    return None


@app.route("/add_time_slot", methods=["POST"])
def add_time_slot():
    # Verify the session token
    session_data = verify_session_token(request)
    print("reached here")
    if not session_data:
        return jsonify({"error": "Unauthorized"}), 401

    # Parse request data
    if not request.is_json:
        return jsonify({"error": "Invalid JSON"}), 400
    
    teacher_id = session_data.get("teacher_id")
    # if not teacher_id:
    #     return jsonify({"error": "Teacher ID not found in session"}), 401

    data = request.get_json()
    start_time = data.get("start_time")
    end_time = data.get("end_time")
    classroom_name = data.get("classroom_name")
    batch_name = data.get("batch_name")
    subject_name = data.get("subject_name")
    day = data.get("day")

    print(f"Received data: {data}")


    if not all([start_time, end_time, classroom_name, batch_name, subject_name, day]):
        return jsonify({"error": "All fields are required"}), 400

    try:
        # Map classroom_name to its ID
        classroom_response = supabase.table("classrooms").select("id").eq("name", classroom_name).execute()
        if not classroom_response.data:
            return jsonify({"error": "Classroom not found"}), 400
        classroom_id = classroom_response.data[0]["id"]

        # Map batch_name to its ID
        batch_response = supabase.table("batches").select("id").eq("name", batch_name).execute()
        if not batch_response.data:
            return jsonify({"error": "Batch not found"}), 400
        batch_id = batch_response.data[0]["id"]

        # Map subject_name to its ID
        subject_response = supabase.table("subjects").select("id").eq("name", subject_name).execute()
        if not subject_response.data:
            return jsonify({"error": "Subject not found"}), 400
        subject_id = subject_response.data[0]["id"]

        print(f"Classroom ID: {classroom_id}, Batch ID: {batch_id}, Subject ID: {subject_id}, Teacher ID: {teacher_id}")
        print(f"nai haga")



        # Insert the new time slot into the database
        insert_response = supabase.table("time_slots").insert({
            "classroom_id": classroom_id,
            "teacher_id": teacher_id,
            "subject_id": subject_id,
            "batch_id":batch_id,  # Assuming batch_id maps to subject_id
            "day": day,  # Current day of the week
            "start_time": start_time,
            "end_time": end_time
        }).execute()

        if insert_response:
            return jsonify({"success": True, "message": "Time slot added successfully"})
        print(f"hug diya2")
        return jsonify({"error": "Failed to insert time slot"}), 500

    except Exception as e:
        app.logger.error(f"Error adding time slot: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)