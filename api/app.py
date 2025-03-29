import time
from flask import Flask, jsonify
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from flask_cors import CORS  # Import CORS

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Get Supabase credentials from .env
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

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
    



if __name__ == '__main__':
    app.run(debug=True)
