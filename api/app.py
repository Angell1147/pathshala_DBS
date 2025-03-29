import time
from flask import Flask, jsonify, request
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from flask_cors import CORS  # Import CORS
from otp_sender import Otp_sender
import random
import secrets

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Get Supabase credentials from .env
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

otp_storage = {}
session_tokens = {}

@app.route("/")
def hello_world():
    return "<p>Hello, World! My name is Soham Margaj</p>"

@app.route('/time')
def get_current_time():
    return {'time': time.time(), 'message': os.getenv('FLASK_APP')}

@app.route("/Batches", methods=["GET"])
def get_free_time_slots_batch():
    response = supabase.rpc("batches").execute()
    # print(response)  # Log the response object to see the data
    if response.data:
        return jsonify(response.data)
    else:
        return jsonify({"error": "No data found or function error"}), 400

@app.route('/allTimeSlots')
def get_all_time_slots():
    # Call the stored function in Supabase
    response = supabase.rpc("get_custom_users").execute()
    if response.data:
        return jsonify(response.data)
    else:
        return jsonify({"error": "No data found or function error"}), 400
    
@app.route("/Classroom", methods=["GET"])
def get_free_time_slots():
    # Call the `get_free_time_slots()` function from Supabase
    response = supabase.rpc("get_free_time_slots_for_classrooms").execute()
    # print(response)
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

    generated_otp = random.randint(100000, 999999)
    otp_storage[email] = generated_otp

    try:
        print(f"Sending OTP {generated_otp} to {email}")
        Otp_sender(email, generated_otp).send_email()
        print("OTP sent successfully")
    except Exception as e:
        print(f"Error sending OTP: {str(e)}")
        return jsonify({"error": f"Failed to send OTP: {str(e)}"}), 500

    return jsonify({"success": True, "message": "OTP sent successfully", "OTP": generated_otp})


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

    if email in otp_storage and int(otp_storage[email]) == int(otp):
        del otp_storage[email] 
        session_tokens[email] = secrets.token_hex(16)

        return jsonify({"success": True, "message": "Login Successful", "session_token": session_tokens[email]})
    else:
        return jsonify({"success": False, "message": "Invalid Email or OTP"}), 401

if __name__ == '__main__':
    app.run(debug=True)
