// DOM elements
const textDisplay = document.getElementById('text-display');
const timerElement = document.getElementById('time');
const wpmElement = document.getElementById('wpm');
const resultsElement = document.getElementById('results');
const finalWpmElement = document.getElementById('final-wpm');
const accuracyElement = document.getElementById('accuracy');
const textSizeDisplay = document.getElementById('text-size');

// Game state
let timeLeft = 30;
let timerInterval = null;
let gameStarted = false;
let currentWordIndex = 0;
let correctCharacters = 0;
let totalCharacters = 0;
let totalKeypresses = 0; 
let wpmHistory = [];
let startTime;

// Text size control
let currentTextSize = 32; 
const minTextSize = 14;
const maxTextSize = 48; 
const textSizeStep = 2;

// Word list for random text generation
const words = [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you',
    'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one',
    'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when',
    'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some',
    'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back',
    'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
    'give', 'day', 'most', 'us', 'very', 'important', 'family', 'world', 'better', 'best', 'love', 'every', 'life', 'learn',
    'should', 'need', 'try', 'something', 'nothing', 'everything', 'anything', 'much', 'another', 'own', 'while', 'last',
    'might', 'great', 'where', 'same', 'through', 'few', 'against', 'order', 'water', 'sound', 'began', 'fact', 'measure',
    'product', 'question', 'happen', 'whole', 'force', 'understand', 'however', 'govern', 'increase', 'material', 'special',
    'current', 'behind', 'possible', 'space', 'course', 'short', 'complete', 'ship', 'area', 'half', 'rock', 'surface',
    'deep', 'moon', 'island', 'foot', 'system', 'busy', 'test', 'keep', 'record', 'boat', 'common', 'gold', 'plane',
    'age', 'wonder', 'laugh', 'thousand', 'ago', 'ran', 'check', 'game', 'shape', 'yes', 'hot', 'miss', 'heavy', 'dance'
];

function updateTextSize(change) {
    currentTextSize = Math.max(minTextSize, Math.min(maxTextSize, currentTextSize + change));
    textSizeDisplay.textContent = `${currentTextSize}px`;
    textDisplay.style.fontSize = `${currentTextSize}px`;
    const lineHeight = 1.8 - (currentTextSize - minTextSize) * 0.02;
    textDisplay.style.lineHeight = lineHeight.toString();
}

function generateText() {
    const wordCount = 200; 
    const selectedWords = [];
    for (let i = 0; i < wordCount; i++) {
        selectedWords.push(words[Math.floor(Math.random() * words.length)]);
    }
    return selectedWords.join(' ');
}

function createTextDisplay(text) {
    textDisplay.innerHTML = '';
    text.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char;
        span.className = 'untyped';
        textDisplay.appendChild(span);
    });
    if (textDisplay.children.length > 0) {
        textDisplay.children[0].className = 'current';
    }
}

function updateWPM() {
    if (!startTime) return;
    
    const timeElapsed = (Date.now() - startTime) / 1000 / 60; // Convert to minutes
    const wordsTyped = correctCharacters / 5; // Standard: 5 characters = 1 word
    const errors = totalCharacters - correctCharacters;
    const netWPM = Math.max(0, Math.round((wordsTyped - errors / 5) / timeElapsed));
    
    wpmElement.textContent = `${netWPM} WPM`;
    
    // Store WPM data every second
    wpmHistory.push({
        time: 30 - timeLeft,
        wpm: netWPM,
        errors: errors,
        accuracy: calculateAccuracy()
    });
}

function calculateAccuracy() {
    if (totalKeypresses === 0) return 0;
    return Math.round((correctCharacters / totalKeypresses) * 100);
}

function showResults() {
    const finalWPM = parseInt(wpmElement.textContent);
    const accuracy = calculateAccuracy();

    resultsElement.style.display = 'flex';
    resultsElement.style.opacity = '0';
    
    setTimeout(() => {
        resultsElement.style.transition = 'opacity 0.5s ease';
        resultsElement.style.opacity = '1';
        
        finalWpmElement.textContent = '0';
        accuracyElement.textContent = '0%';
        
        let currentWPM = 0;
        let currentAcc = 0;
        const duration = 1500;
        const steps = 60;
        const wpmIncrement = finalWPM / steps;
        const accIncrement = accuracy / steps;
        const stepDuration = duration / steps;
        
        const animateNumbers = setInterval(() => {
            currentWPM = Math.min(finalWPM, currentWPM + wpmIncrement);
            currentAcc = Math.min(accuracy, currentAcc + accIncrement);
            
            finalWpmElement.textContent = Math.round(currentWPM);
            accuracyElement.textContent = Math.round(currentAcc) + '%';
            
            if (currentWPM >= finalWPM && currentAcc >= accuracy) {
                clearInterval(animateNumbers);
                createSpeedChart();
            }
        }, stepDuration);
    }, 100);
}

function createSpeedChart() {
    const ctx = document.createElement('canvas').getContext('2d');
    document.getElementById('speedChart').replaceWith(ctx.canvas);

    // Filter out duplicate time entries and ensure we have data points for each second
    const normalizedData = [];
    for (let second = 0; second <= 30; second++) {
        const dataPoints = wpmHistory.filter(entry => entry.time === second);
        if (dataPoints.length > 0) {
            // Take the average if multiple entries exist for the same second
            normalizedData.push({
                time: second,
                wpm: Math.round(dataPoints.reduce((sum, point) => sum + point.wpm, 0) / dataPoints.length),
                accuracy: Math.round(dataPoints.reduce((sum, point) => sum + point.accuracy, 0) / dataPoints.length)
            });
        }
    }

    // Apply moving average smoothing
    const smoothingWindow = 3; // Use 3-second window for smoothing
    const smoothedData = normalizedData.map((entry, index, array) => {
        const start = Math.max(0, index - Math.floor(smoothingWindow / 2));
        const end = Math.min(array.length, index + Math.floor(smoothingWindow / 2) + 1);
        const windowData = array.slice(start, end);
        
        return {
            time: entry.time,
            wpm: Math.round(windowData.reduce((sum, point) => sum + point.wpm, 0) / windowData.length),
            accuracy: Math.round(windowData.reduce((sum, point) => sum + point.accuracy, 0) / windowData.length)
        };
    });

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: smoothedData.map(entry => entry.time + 's'),
            datasets: [
                {
                    label: 'WPM',
                    data: smoothedData.map(entry => entry.wpm),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 2,
                    fill: true
                },
                {
                    label: 'Accuracy',
                    data: smoothedData.map(entry => entry.accuracy),
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 2,
                    fill: true,
                    hidden: true // Initially hidden, can be toggled
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(59, 130, 246, 0.1)',
                        drawBorder: false
                    },
                    ticks: { 
                        color: '#94a3b8',
                        maxTicksLimit: 10, // Show maximum 10 ticks on x-axis
                        callback: function(value, index) {
                            const label = this.getLabelForValue(value);
                            return label.replace('s', ''); // Remove 's' from label
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(59, 130, 246, 0.1)',
                        drawBorder: false
                    },
                    ticks: { 
                        color: '#94a3b8',
                        maxTicksLimit: 8 // Show maximum 8 ticks on y-axis
                    },
                    min: 0,
                    suggestedMax: function(context) {
                        const maxWPM = Math.max(...smoothedData.map(d => d.wpm));
                        return Math.ceil(maxWPM / 10) * 10; // Round up to nearest 10
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#94a3b8',
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(59, 130, 246, 0.2)',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        title: function(tooltipItems) {
                            return `Time: ${tooltipItems[0].label}`;
                        },
                        label: function(context) {
                            const label = context.dataset.label;
                            const value = context.parsed.y;
                            return `${label}: ${value}${label === 'Accuracy' ? '%' : ''}`;
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

function startTimer() {
    const startColor = [59, 130, 246];
    const endColor = [239, 68, 68];
    
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `${timeLeft}s`;
        
        if (timeLeft <= 10) {
            const progress = (10 - timeLeft) / 10;
            const currentColor = startColor.map((start, i) => 
                Math.round(start + (endColor[i] - start) * progress)
            );
            timerElement.style.color = `rgb(${currentColor.join(',')})`;
            timerElement.style.textShadow = `0 0 10px rgba(${currentColor.join(',')}, 0.3)`;
        }
        
        updateWPM();

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    clearInterval(timerInterval);
    document.removeEventListener('keydown', handleKeypress);
    showResults();
}

function resetGame() {
    textDisplay.innerHTML = '';
    textDisplay.classList.add('skeleton');
    
    timerElement.style.color = 'rgb(59, 130, 246)';
    timerElement.style.textShadow = 'none';
    
    document.removeEventListener('keydown', handleKeypress);
    
    setTimeout(() => {
        timeLeft = 30;
        gameStarted = false;
        currentWordIndex = 0;
        correctCharacters = 0;
        totalCharacters = 0;
        totalKeypresses = 0;
        wpmHistory = [];
        startTime = null;
        
        timerElement.textContent = '30s';
        wpmElement.textContent = '0 WPM';
        resultsElement.style.display = 'none';
        
        const text = generateText();
        textDisplay.classList.remove('skeleton');
        createTextDisplay(text);
        
        clearInterval(timerInterval);
        document.addEventListener('keydown', handleKeypress);
    }, 500);
}

// Global keyboard event listener for backtick
document.addEventListener('keydown', function(e) {
    if (e.key === '`') {
        e.preventDefault();
        resetGame();
    }
});

function handleKeypress(e) {
    if (e.key === '`') {
        return;
    }

    if (!gameStarted && e.key.length === 1) {
        gameStarted = true;
        startTime = Date.now();
        startTimer();
    }

    const currentChar = textDisplay.children[totalCharacters];
    if (!currentChar || timeLeft <= 0) return;

    if (e.key === 'Backspace' && totalCharacters > 0) {
        totalCharacters--;
        const charToReset = textDisplay.children[totalCharacters];
        charToReset.className = 'untyped';
        if (charToReset.classList.contains('correct')) {
            correctCharacters--;
        }
        totalKeypresses++; 
        
        if (textDisplay.children[totalCharacters + 1]) {
            textDisplay.children[totalCharacters + 1].className = 'untyped';
        }
        if (textDisplay.children[totalCharacters]) {
            textDisplay.children[totalCharacters].className = 'current';
        }
        return;
    }

    if (e.key.length === 1) {
        totalKeypresses++; 
        if (e.key === currentChar.textContent) {
            currentChar.className = 'correct';
            correctCharacters++;
        } else {
            currentChar.className = 'incorrect';
        }
        
        totalCharacters++;

        if (textDisplay.children[totalCharacters]) {
            textDisplay.children[totalCharacters].className = 'current';
        }
    }
}

// Initialize text size controls
document.getElementById('increase-text').addEventListener('click', () => updateTextSize(textSizeStep));
document.getElementById('decrease-text').addEventListener('click', () => updateTextSize(-textSizeStep));

// Initialize game
document.addEventListener('keydown', handleKeypress);
updateTextSize(0); 
resetGame();
