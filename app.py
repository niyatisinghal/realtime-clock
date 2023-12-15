# app.py
from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import time
from datetime import datetime
import pytz

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def index():
    timezones = pytz.all_timezones
    return render_template('index.html', timezones=timezones)

@socketio.on('connect')
def handle_connect():
    emit('update_time', {'current_time': get_current_time()})

@socketio.on('change_timezone')
def handle_change_timezone(data):
    timezone = data['timezone']
    emit('update_time', {'current_time': get_current_time(timezone)})

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

def get_current_time(timezone='UTC'):
    tz = pytz.timezone(timezone)
    current_time = datetime.now(tz).strftime('%Y-%m-%d %H:%M:%S %Z')
    return current_time

if __name__ == '__main__':
    socketio.run(app, debug=True)
