// static/app.js
var socket = io.connect(window.location.origin);

socket.on('update_time', function(data) {
    document.getElementById('current-time').innerHTML = data.current_time;
    updateClock(data.current_time);
});

var stopwatchRunning = false;
var stopwatchInterval;
var stopwatchStartTime;

function changeTimeZone() {
    var selectedTimeZone = document.getElementById('timezone').value;
    socket.emit('change_timezone', {'timezone': selectedTimeZone});
}

function updateClock(currentTime) {
    var selectedTimeZone = document.getElementById('timezone').value;
    var formattedTime = moment.tz(currentTime, selectedTimeZone);
    drawAnalogClock(formattedTime);
}

function drawAnalogClock(time) {
    var canvas = document.getElementById('clock-canvas');
    var context = canvas.getContext('2d');
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var radius = canvas.width / 2 - 10;

    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw clock face
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    context.fillStyle = '#fff';
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = '#333';
    context.stroke();
    context.closePath();

    // Draw clock numbers
    for (var i = 1; i <= 12; i++) {
        var angle = (i * 30 - 60) * Math.PI / 180;
        var x = centerX + radius * 0.85 * Math.cos(angle);
        var y = centerY + radius * 0.85 * Math.sin(angle);

        context.font = '20px Arial';
        context.fillStyle = '#333';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(i, x, y);
    }

    // Draw clock hands
    drawClockHand(context, centerX, centerY, time.hours() % 12 * 30 + time.minutes() / 2, radius * 0.5, 10, '#333');  // Hour hand
    drawClockHand(context, centerX, centerY, time.minutes() * 6, radius * 0.7, 5, '#555');  // Minute hand
    drawClockHand(context, centerX, centerY, time.seconds() * 6, radius * 0.9, 2, '#ff0000');  // Second hand
}

function drawClockHand(context, centerX, centerY, degrees, length, width, color) {
    var radians = (degrees - 90) * Math.PI / 180;
    var x = centerX + length * Math.cos(radians);
    var y = centerY + length * Math.sin(radians);

    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(x, y);
    context.lineWidth = width;
    context.strokeStyle = color;
    context.stroke();
    context.closePath();
}

setInterval(function() {
    var currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    document.getElementById('current-time').innerHTML = currentTime;
    updateClock(currentTime);
}, 1000);

var stopwatchRunning = false;
var stopwatchInterval;
var stopwatchStartTime;

function startStopwatch() {
    if (!stopwatchRunning) {
        stopwatchStartTime = new Date().getTime();
        stopwatchInterval = setInterval(updateStopwatch, 1000);
        stopwatchRunning = true;
    }
}

function stopStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchRunning = false;
}

function resetStopwatch() {
    stopStopwatch();
    updateStopwatchDisplay(0);
}

function updateStopwatch() {
    var currentTime = new Date().getTime();
    var elapsedMilliseconds = currentTime - stopwatchStartTime;
    var elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
    updateStopwatchDisplay(elapsedSeconds);
}

function updateStopwatchDisplay(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var remainingSeconds = seconds % 60;

    var displayString = formatTimeComponent(hours) + ":" +
                        formatTimeComponent(minutes) + ":" +
                        formatTimeComponent(remainingSeconds);

    document.getElementById('stopwatch-display').innerHTML = displayString;
}

function formatTimeComponent(component) {
    return component < 10 ? "0" + component : component;
}

var timerRunning = false;
var timerInterval;
var timerEndTime;

function startTimer() {
    if (!timerRunning) {
        var timerInput = document.getElementById('timer-input').value;
        if (timerInput && timerInput > 0) {
            var currentTime = new Date().getTime();
            timerEndTime = currentTime + timerInput * 1000;
            timerInterval = setInterval(updateTimer, 1000);
            timerRunning = true;
        } else {
            alert('Please enter a valid timer duration.');
        }
    }
}

function stopTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
}

function resetTimer() {
    stopTimer();
    updateTimerDisplay(0);
    document.getElementById('timer-input').value = '';
}

function updateTimer() {
    var currentTime = new Date().getTime();
    var remainingMilliseconds = timerEndTime - currentTime;
    if (remainingMilliseconds > 0) {
        var remainingSeconds = Math.floor(remainingMilliseconds / 1000);
        updateTimerDisplay(remainingSeconds);
    } else {
        stopTimer();
        updateTimerDisplay(0);
        alert('Timer expired!');
    }
}

function updateTimerDisplay(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var remainingSeconds = seconds % 60;

    var displayString = formatTimeComponent(hours) + ":" +
                        formatTimeComponent(minutes) + ":" +
                        formatTimeComponent(remainingSeconds);

    document.getElementById('timer-display').innerHTML = displayString;
}

