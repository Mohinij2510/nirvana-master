from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)


# Dummy database for now
users = {
    "test@example.com": {
        "password": "123456",
        "profile_name": "Test User"
    }
}


DATA_FILE = 'appointments.json'

def load_appointments():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return []

def save_appointments(appointments):
    with open(DATA_FILE, 'w') as f:
        json.dump(appointments, f)

@app.route('/api/appointments/add', methods=['POST'])
def add_appointment():
    data = request.json
    appointments = load_appointments()
    appointments.append(data)
    save_appointments(appointments)
    return jsonify({"status": "success", "data": data}), 200

@app.route('/api/appointments', methods=['GET'])
def get_appointments_by_date():
    date = request.args.get('date')
    appointments = load_appointments()
    if date:
        filtered = [a for a in appointments if a['date'] == date]
        return jsonify(filtered)
    return jsonify(appointments)

@app.route('/api/appointments/month', methods=['GET'])
def get_appointments_by_month():
    month = request.args.get('month').zfill(2)
    year = request.args.get('year')
    appointments = load_appointments()
    filtered = [a for a in appointments if a['date'].startswith(f"{year}-{month}")]
    return jsonify(filtered)

@app.route('/api/appointments/reset', methods=['POST'])
def reset_appointments():
    save_appointments([])
    return jsonify({"message": "All appointments cleared."})

@app.route('/api/appointments/update', methods=['POST'])
def update_appointment():
    data = request.json
    date = data.get('date')
    name = data.get('name')
    new_time = data.get('time')

    appointments = load_appointments()
    updated = False
    for appt in appointments:
        if appt['name'] == name and appt['date'] == date:
            appt['time'] = new_time
            updated = True
            break

    if updated:
        save_appointments(appointments)
        return jsonify({"message": "Appointment updated"}), 200
    else:
        return jsonify({"message": "Appointment not found"}), 404

if __name__ == "__main__":
    app.run(debug=True,port=8000)

