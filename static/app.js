// static/app.js

var socket = io.connect(window.location.origin);

socket.on('update_time', function(data) {
    updateClock(data.current_time, 'clock-canvas');
});

// Analog Clock
function updateClock(currentTime, canvasId) {
    var selectedTimeZone = document.getElementById('timezone').value;
    var formattedTime = moment.tz(currentTime, selectedTimeZone);
    drawAnalogClock(formattedTime, canvasId);
}

function drawAnalogClock(time, canvasId) {
    var canvas = document.getElementById(canvasId);
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
        var angle = (i * 30 ) * Math.PI / 180;
        var x = centerX + radius * 0.9 * Math.cos(angle - Math.PI / 2);
        var y = centerY + radius * 0.9 * Math.sin(angle - Math.PI / 2);


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

// Timer
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

// Stopwatch
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

// Time zone change event
function changeTimeZone() {
    var selectedTimeZones = document.getElementById('additional-timezone-list').getElementsByTagName('li');

    for (var i = 0; i < selectedTimeZones.length; i++) {
        var timeZone = selectedTimeZones[i].getAttribute('data-timezone');
        var currentTime = moment.tz(moment(), timeZone).format('YYYY-MM-DD HH:mm:ss');

        // Update the time in the additional clock section
        var additionalClockContainer = selectedTimeZones[i];
        additionalClockContainer.innerHTML = '<span class="timezone-name">' + timeZone + '</span>: ' + currentTime;

        // Draw the analog clock for the additional time zone
        drawAnalogClockForTimeZone(moment.tz(currentTime, timeZone), 'additional-clock-canvas-' + i);
    }
}


// Alarm
var alarms = []; // Updated variable to store alarms
var alarmInterval;

function setAlarm() {
    clearAlarm(); // Clear any existing alarms
    var alarmTimeInput = document.getElementById('alarm-time');
    
    // Check if a valid date and time is selected
    if (alarmTimeInput.value) {
        var userSelectedTime = new Date(alarmTimeInput.value);
        var alarmTime = moment(userSelectedTime).format('YYYY-MM-DD HH:mm:ss');

        alarms.push(alarmTime); // Store the alarm time in the alarms array
        updateAlarmList(); // Display the alarm in the list

        // Check alarms every second only if there are alarms
        if (alarms.length > 0 && !alarmInterval) {
            alarmInterval = setInterval(checkAlarms, 1000);
        }
        } else {
            alert('Please select a valid alarm time.');
        }
        console.log('Alarms:', alarms);

}

function clearAlarm() {
    clearInterval(alarmInterval);
    alarms = [];
    updateAlarmList();
}
function checkAlarms() {
    var alarmMessageElement = document.getElementById('alarm-message');
    if (alarmMessageElement) {
        alarmMessageElement.innerHTML = 'Alarm! It\'s time!';
    }
    var currentTime = new Date().getTime();
    console.log('Checking alarms...');

    // Check each alarm in the list
    alarms.forEach(function (alarmTime) {
        var formattedAlarmTime = moment(alarmTime).format('YYYY-MM-DD HH:mm:ss');
        if (currentTime >= alarmTime) {
            document.getElementById('alarm-message').innerHTML = 'Alarm! It\'s time: ' + formattedAlarmTime;
        }
    });

    // Remove triggered alarms from the array
    alarms = alarms.filter(function (alarmTime) {
        return currentTime < alarmTime;
    });

    // Update the displayed list of alarms
    updateAlarmList();

    // If no more alarms, clear the interval
    if (alarms.length === 0) {
        clearInterval(alarmInterval);
        alarmInterval = null;
    }
}

// Function to add a new alarm
function addAlarm() {
    var alarmTimeInput = document.getElementById('alarm-time');

    // Check if a valid date and time is selected
    if (alarmTimeInput.value) {
        var alarmTime = new Date(alarmTimeInput.value).getTime();
        
        // Store the alarm time in the alarms array
        alarms.push(alarmTime);

        // Display the alarm in the list
        updateAlarmList();

        // Clear the input field
        alarmTimeInput.value = '';
    } else {
        alert('Please select a valid alarm time.');
    }
}

// Function to clear all alarms
function clearAllAlarms() {
    alarms = [];
    updateAlarmList();
}

// Function to update the alarm list in the HTML
function updateAlarmList() {
    var alarmsList = document.getElementById('alarms-list');
    alarmsList.innerHTML = '';

    alarms.forEach(function(alarmTime, index) {
        var listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.innerHTML = '<strong>Alarm ' + (index + 1) + ':</strong> ' + moment(alarmTime).format('YYYY-MM-DD HH:mm:ss');
        alarmsList.appendChild(listItem);
    });
}



// Updated function to create an additional clock for a specific time zone
function createTimeZoneClock(timeZone, index) {
    var currentTime = moment.tz(moment(), timeZone);

    // Create a unique ID for each additional clock
    var clockId = 'additional-clock-canvas-' + index;

    // Display the time in the additional clock section
    var additionalClockContainer = document.getElementById('additional-clocks');
    var additionalClockDiv = document.createElement('div');
    additionalClockDiv.className = 'additional-clock-item';
    additionalClockDiv.setAttribute('data-timezone', timeZone); 
    additionalClockDiv.innerHTML = '<span class="timezone-name">' + timeZone + '</span>: ' + currentTime.format('YYYY-MM-DD HH:mm:ss');

    // Create a canvas for the additional clock
    var canvas = document.createElement('canvas');
    canvas.id = clockId;
    canvas.width = 200;
    canvas.height = 200;

    // Add the remove button for each additional clock
    var removeButton = document.createElement('button');
    removeButton.className = 'btn btn-danger btn-sm float-right';
    removeButton.innerHTML = 'Remove';
    removeButton.addEventListener('click', function() {
        additionalClockDiv.remove();
        removeTimeZone(timeZone); 
    });

    // Append the remove button to the additional clock div
    additionalClockDiv.appendChild(removeButton);

    // Append the canvas to the additional clock div
    additionalClockDiv.appendChild(canvas);
    additionalClockContainer.appendChild(additionalClockDiv);

    // Draw the analog clock for the additional time zone
    drawAnalogClockForTimeZone(currentTime, clockId);
}


// Function to remove a time zone from the list and update display
function removeTimeZone(timeZone) {
    // Remove the time zone from the list
    var listItems = document.getElementById('additional-timezone-list').getElementsByTagName('li');
    for (var i = 0; i < listItems.length; i++) {
        if (listItems[i].getAttribute('data-timezone') === timeZone) {
            listItems[i].remove();
        }
    }

    // Remove the corresponding clock from the display
    var additionalClockContainer = document.getElementById('additional-clocks');
    var clocks = additionalClockContainer.getElementsByClassName('additional-clock-item');
    for (var j = 0; j < clocks.length; j++) {
        if (clocks[j].getAttribute('data-timezone') === timeZone) {
            // Remove the canvas element
            var canvas = clocks[j].getElementsByTagName('canvas')[0];
            if (canvas) {
                canvas.remove();
            }

            // Remove the entire clock div
            clocks[j].remove();
        }
    }

    // Redraw remaining clocks
    updateAdditionalClocks();
}

function updateAdditionalClocks() {
    var selectedTimeZones = document.getElementById('additional-timezone-list').getElementsByTagName('li');

    for (var i = 0; i < selectedTimeZones.length; i++) {
        var timeZone = selectedTimeZones[i].getAttribute('data-timezone');
        var currentTime = moment.tz(moment(), timeZone).format('YYYY-MM-DD HH:mm:ss');

        // Update the time in the additional clock section
        var additionalClockContainer = selectedTimeZones[i];
        additionalClockContainer.innerHTML = '<span class="timezone-name">' + timeZone + '</span>: ' + currentTime;

        // Draw the analog clock for the additional time zone
        drawAnalogClockForTimeZone(moment.tz(currentTime, timeZone), 'additional-clock-canvas-' + i);
    }
}

    



// Function to update the time for a specific time zone
function updateAdditionalClock(timeZone, elementId) {
    var currentTime = moment.tz(moment(), timeZone).format('YYYY-MM-DD HH:mm:ss');
    document.getElementById(elementId).innerHTML = '<span class="timezone-name">' + timeZone + '</span>: ' + currentTime;
    drawAnalogClockForTimeZone(moment.tz(currentTime, timeZone), elementId);
}

// Function to update all additional clocks
function updateAllAdditionalClocks() {
    var selectedTimeZones = document.getElementById('additional-timezone-list').getElementsByTagName('li');

    for (var i = 0; i < selectedTimeZones.length; i++) {
        var timeZone = selectedTimeZones[i].getAttribute('data-timezone');
        var elementId = 'additional-clock-canvas-' + i;
        updateAdditionalClock(timeZone, elementId);
    }
}

function updateAdditionalClocksDisplay() {
    var selectedTimeZones = document.getElementById('additional-timezone-list').getElementsByTagName('li');

    for (var i = 0; i < selectedTimeZones.length; i++) {
        var timeZone = selectedTimeZones[i].getAttribute('data-timezone');

        // Draw the analog clock for the additional time zone
        drawAnalogClockForTimeZone(moment.tz(moment(), timeZone), 'additional-clock-canvas-' + i);

        // Update the time in the additional clock section
        var additionalClockContainer = selectedTimeZones[i];
        var timeDisplayElement = additionalClockContainer.getElementsByClassName('additional-clock-time')[0];

        if (!timeDisplayElement) {
            // Create a new element for displaying time if not exists
            timeDisplayElement = document.createElement('div');
            timeDisplayElement.className = 'additional-clock-time';
            additionalClockContainer.appendChild(timeDisplayElement);
        }

        var currentTime = moment.tz(moment(), timeZone).format('YYYY-MM-DD HH:mm:ss');
        timeDisplayElement.innerHTML = '<span class="timezone-name">' + timeZone + '</span>: ' + currentTime;
    }
}




function addSelectedTimeZone() {
    var selectedTimeZone = document.getElementById('timezone').value;

    // Check if the time zone is already added
    var existingTimeZones = document.getElementById('additional-timezone-list').getElementsByTagName('li');
    for (var i = 0; i < existingTimeZones.length; i++) {
        if (existingTimeZones[i].getAttribute('data-timezone') === selectedTimeZone) {
            alert('This time zone is already added.');
            return;
        }
    }

    // Create a new list item for the added time zone
    var listItem = document.createElement('li');
    listItem.setAttribute('data-timezone', selectedTimeZone);
    listItem.className = 'list-group-item';

    // Add a button to remove the time zone
    var removeButton = document.createElement('button');
    removeButton.className = 'btn btn-danger btn-sm float-right';
    removeButton.innerHTML = 'Remove';
    removeButton.addEventListener('click', function() {
        listItem.remove();
        removeTimeZone(selectedTimeZone); 
        updateTimesInList(); 

    });

    // Display the time zone name and current time
    var currentTime = moment.tz(moment(), selectedTimeZone).format('YYYY-MM-DD HH:mm:ss');
    listItem.innerHTML = '<span class="timezone-name">' + selectedTimeZone + '</span>: ' + currentTime;
    listItem.appendChild(removeButton);

    // Add the new time zone to the list
    document.getElementById('additional-timezone-list').appendChild(listItem);

    // Draw the analog clock for the additional time zone
    createTimeZoneClock(selectedTimeZone);
    updateAdditionalClocks();

    // Create a new canvas for the added time zone
    var canvasId = 'additional-clock-canvas-' + (existingTimeZones.length - 1);
    var canvas = document.createElement('canvas');
    canvas.id = canvasId;
    canvas.width = 200;
    canvas.height = 200;

    // Add the canvas to the additional clocks div
    document.getElementById('additional-clocks').appendChild(canvas);

    // Call the function to update all additional clocks
    updateAllAdditionalClocks();
    // Update times for each time zone every second
    updateTimesInList();

}

function updateTimesInList() {
    setInterval(function() {
        var selectedTimeZones = document.getElementById('additional-timezone-list').getElementsByTagName('li');

        for (var i = 0; i < selectedTimeZones.length; i++) {
            var timeZone = selectedTimeZones[i].getAttribute('data-timezone');
            var currentTime = moment.tz(moment(), timeZone).format('YYYY-MM-DD HH:mm:ss');

            // Update the time in the additional clock section
            var additionalClockContainer = selectedTimeZones[i];
            additionalClockContainer.innerHTML = '<span class="timezone-name">' + timeZone + '</span>: ' + currentTime;

            // Draw the analog clock for the additional time zone
            drawAnalogClockForTimeZone(moment.tz(currentTime, timeZone), 'additional-clock-canvas-' + i);
        }
    }, 1000);
}


// Handle real-time updates for the main clock 
setInterval(function() {
    var currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    document.getElementById('current-time-main').innerHTML = currentTime;
    updateClock(currentTime, 'clock-canvas');
}, 1000);

setInterval(function() {
    var currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
    document.getElementById('current-time-main').innerHTML = currentTime;
    updateClock(currentTime, 'clock-canvas');
}, 1000);


// setInterval for the additional clock 
setInterval(function() {
    var selectedTimeZone = document.getElementById('timezone').value;
    console.log('Selected Time Zone:', selectedTimeZone);

    var currentTime = moment.tz(moment(), selectedTimeZone).format('YYYY-MM-DD HH:mm:ss');
    console.log('Current Time in Selected Time Zone:', currentTime);
    
    drawAnalogClock(moment.tz(currentTime, selectedTimeZone), 'additional-clock-canvas');
}, 1000);

// Add a setInterval for updating additional clocks
setInterval(function() {
    updateAllAdditionalClocks();
}, 1000);

// Add a setInterval for updating additional clocks
setInterval(function() {
    updateAdditionalClocks();
}, 1000);

// Add a setInterval to update the time display below each additional clock every second
setInterval(function() {
    updateAdditionalClocksDisplay();
}, 1000);

