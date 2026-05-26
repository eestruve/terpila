// State Variables
let isRunning = false;
let startTimeMillis = 0;
let playCount = 0;
let timerTimeoutId = null;
let currentAudio = null;

// Audio Files Definition
const audioPaths = [
    'audio/phrase_0.mp3', // "Чёрт возьми, не сдавайся!"
    'audio/phrase_1.mp3', // "Чёрт, подними, тягай это железо!"
    'audio/phrase_2.mp3', // "Мать твою, не бросай это!"
    'audio/phrase_3.mp3', // "Если хочешь закончить, помни, зачем начал!"
    'audio/phrase_4.mp3', // "Давай!"
    'audio/phrase_5.mp3'  // "Дисциплина — она выгребет, не привычка!"
];

// Preload Audio objects
const audios = audioPaths.map(path => {
    const a = new Audio(path);
    a.preload = 'auto';
    return a;
});

// DOM Elements
const btnStartStop = document.getElementById('btn-start-stop');
const btnGotoStats = document.getElementById('btn-goto-stats');
const btnBack = document.getElementById('btn-back');
const screenMain = document.getElementById('screen-main');
const screenStats = document.getElementById('screen-stats');
const statsList = document.getElementById('stats-list');

// Page Navigation
btnGotoStats.addEventListener('click', () => {
    loadStats();
    screenMain.classList.add('inactive');
    screenStats.classList.add('active');
});

btnBack.addEventListener('click', () => {
    screenStats.classList.remove('active');
    screenMain.classList.remove('inactive');
});

// iOS HTML5 Audio Unlocking
function unlockAudio() {
    audios.forEach(audio => {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                audio.pause();
                audio.currentTime = 0;
            }).catch(error => {
                console.log("Audio unlock debug:", error);
            });
        }
    });
}

// Start/Stop Handler
btnStartStop.addEventListener('click', () => {
    // Attempt to unlock all audios on user gesture (required for iOS Safari)
    unlockAudio();

    if (isRunning) {
        stopTimer();
    } else {
        startTimer();
    }
});

function playAudio(index) {
    try {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        currentAudio = audios[index];
        currentAudio.play().catch(e => {
            console.log("Audio playback failed:", e);
        });
    } catch (e) {
        console.log("playAudio exception:", e);
    }
}

function startTimer() {
    isRunning = true;
    playCount = 0;
    startTimeMillis = Date.now();

    // UI Updates
    btnStartStop.textContent = 'СТОП';
    btnStartStop.className = 'btn-stop pulsing';

    // Play first phrase immediately
    playAudio(playCount);
    playCount++;

    // Loop
    runTimerCycle();
}

function runTimerCycle() {
    timerTimeoutId = setTimeout(() => {
        if (isRunning) {
            let index;
            if (playCount < audios.length) {
                index = playCount;
            } else {
                index = Math.floor(Math.random() * audios.length);
            }
            playAudio(index);
            playCount++;

            runTimerCycle(); // loop
        }
    }, 10000); // every 10s
}

function stopTimer() {
    isRunning = false;
    if (timerTimeoutId) {
        clearTimeout(timerTimeoutId);
        timerTimeoutId = null;
    }

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    // UI Updates
    btnStartStop.textContent = 'СТАРТ';
    btnStartStop.className = 'btn-start';

    // Calculate duration
    const durationMillis = Date.now() - startTimeMillis;
    const seconds = Math.floor(durationMillis / 1000) % 60;
    const minutes = Math.floor(durationMillis / (1000 * 60)) % 60;
    const hours = Math.floor(durationMillis / (1000 * 60 * 60));

    let durationStr = '';
    if (hours > 0) {
        durationStr = `${hours} ч ${minutes} мин ${seconds} сек`;
    } else if (minutes > 0) {
        durationStr = `${minutes} мин ${seconds} сек`;
    } else {
        durationStr = `${seconds} сек`;
    }

    // Format current date: DD.MM.YYYY, HH:MM
    const now = new Date();
    const pad = (num) => String(num).padStart(2, '0');
    const dateStr = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}, ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    saveStat(dateStr, durationStr);
}

// Statistics Management
function saveStat(date, duration) {
    const history = JSON.parse(localStorage.getItem('history') || '[]');
    history.unshift({ date, duration });
    localStorage.setItem('history', JSON.stringify(history));
}

function loadStats() {
    statsList.innerHTML = '';
    const history = JSON.parse(localStorage.getItem('history') || '[]');

    if (history.length === 0) {
        statsList.innerHTML = '<div class="stat-item" style="text-align:center; color: var(--text-muted);">История пуста</div>';
        return;
    }

    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'stat-item';
        div.innerHTML = `
            <span class="stat-date">${item.date}</span>
            <span class="stat-duration">Продолжительность: ${item.duration}</span>
        `;
        statsList.appendChild(div);
    });
}

// Register Service Worker for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(reg => {
            console.log('ServiceWorker registration successful with scope: ', reg.scope);
        }).catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
