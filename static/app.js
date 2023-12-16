// static/app.js
var socket = io.connect(window.location.origin);

socket.on('update_time', function(data) {
    document.getElementById('current-time').innerHTML = data.current_time;
    updateClock(data.current_time);
});



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