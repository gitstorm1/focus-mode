const FOCUS_TIME_SECONDS = 5 * 60;

const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-btn');
const exitBtn = document.getElementById('exit-btn');
const continueBtn = document.getElementById('continue-btn');

let state = 'IDLE'; // States: IDLE, COUNTDOWN, PROMPT, STOPWATCH
let intervalId = null;
// Register service worker for notification actions
let swRegistration = null;
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(function (registration) {
        swRegistration = registration;
    }).catch(function (error) {
        console.error('Service Worker Error', error);
    });

    navigator.serviceWorker.addEventListener('message', function (event) {
        if (event.data && event.data.action === 'continue') {
            continueBtn.click();
        } else if (event.data && event.data.action === 'exit') {
            exitBtn.click();
        }
    });
}

function requestNotificationPermission() {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
    }
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    const formattedM = m.toString().padStart(2, '0');
    const formattedS = s.toString().padStart(2, '0');

    if (h > 0) {
        return `${h}:${formattedM}:${formattedS}`;
    }
    return `${formattedM}:${formattedS}`;
}

function updateDisplay(time) {
    timerDisplay.textContent = formatTime(time);
}

function setUIState(newState) {
    state = newState;
    if (state === 'IDLE') {
        startBtn.classList.remove('hidden');
        exitBtn.classList.add('hidden');
        continueBtn.classList.add('hidden');
        updateDisplay(FOCUS_TIME_SECONDS);
    } else if (state === 'COUNTDOWN') {
        startBtn.classList.add('hidden');
        exitBtn.classList.remove('hidden');
        continueBtn.classList.add('hidden');
    } else if (state === 'PROMPT') {
        startBtn.classList.add('hidden');
        exitBtn.classList.remove('hidden');
        continueBtn.classList.remove('hidden');
    } else if (state === 'STOPWATCH') {
        startBtn.classList.add('hidden');
        exitBtn.classList.remove('hidden');
        continueBtn.classList.add('hidden');
    }
}

function stopTimer() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}

function sendNotification() {
    if ("Notification" in window && Notification.permission === "granted") {
        if (swRegistration) {
            swRegistration.showNotification("Focus Session Complete", {
                body: "Your focus session is done. Want to keep going?",
                requireInteraction: true,
                actions: [
                    { action: 'continue', title: 'Continue' },
                    { action: 'exit', title: 'Exit' },
                ]
            });
        } else {
            new Notification("Focus Session Complete", {
                body: "Your focus session is done. Want to keep going?",
                requireInteraction: true
            });
        }
    }
}

startBtn.addEventListener('click', () => {
    requestNotificationPermission();
    setUIState('COUNTDOWN');
    
    const startTime = Date.now();
    const durationMs = FOCUS_TIME_SECONDS * 1000;
    
    updateDisplay(FOCUS_TIME_SECONDS);
    
    intervalId = setInterval(() => {
        const elapsedMs = Date.now() - startTime;
        const remainingSeconds = Math.max(0, Math.ceil((durationMs - elapsedMs) / 1000));
        
        updateDisplay(remainingSeconds);
        
        if (remainingSeconds <= 0) {
            stopTimer();
            setUIState('PROMPT');
            sendNotification();
        }
    }, 100); // Update more frequently for a smoother display
});

continueBtn.addEventListener('click', () => {
    setUIState('STOPWATCH');
    
    const startTime = Date.now();
    const offsetMs = FOCUS_TIME_SECONDS * 1000; // Start counting up from the 5-minute mark
    
    updateDisplay(FOCUS_TIME_SECONDS);
    
    intervalId = setInterval(() => {
        const elapsedMs = Date.now() - startTime;
        const totalSeconds = Math.floor((offsetMs + elapsedMs) / 1000);
        
        updateDisplay(totalSeconds);
    }, 100);
});

exitBtn.addEventListener('click', () => {
    stopTimer();
    setUIState('IDLE');
});

// Initialize app
setUIState('IDLE');
