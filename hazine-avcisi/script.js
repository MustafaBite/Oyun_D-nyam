let treasureX, treasureY;
let maxAttempts = 5;
let attemptsLeft = 5;
let guessCount = 0;
let gameOver = false;
let guessedCells = new Set();
let startTime = null;
let bestScore = null;

function loadBestScore() {
    const saved = localStorage.getItem('hazineAvcisiBestScore');
    return saved ? JSON.parse(saved) : null;
}

function saveBestScore(guesses, time) {
    const score = { guesses, time, date: new Date().toLocaleDateString('tr-TR') };
    localStorage.setItem('hazineAvcisiBestScore', JSON.stringify(score));
    bestScore = score;
}

// En iyi skoru yükle
bestScore = loadBestScore();

function initGame() {
    treasureX = Math.floor(Math.random() * 5);
    treasureY = Math.floor(Math.random() * 5);
    attemptsLeft = maxAttempts;
    guessCount = 0;
    gameOver = false;
    guessedCells.clear();
    startTime = Date.now();
    
    updateDisplay();
    createMap();
    showMessage('Hazine 5x5 haritada bir yerde gizli. Koordinatları tahmin et!', '');
    
    document.getElementById('xInput').value = '';
    document.getElementById('yInput').value = '';
    document.getElementById('guessBtn').disabled = false;
}

function createMap() {
    const mapGrid = document.getElementById('mapGrid');
    mapGrid.innerHTML = '';
    
    // Boş köşe
    const corner = document.createElement('div');
    mapGrid.appendChild(corner);
    
    // Üst X koordinatları (0-4)
    for (let x = 0; x < 5; x++) {
        const label = document.createElement('div');
        label.className = 'coord-label';
        label.textContent = x;
        mapGrid.appendChild(label);
    }
    
    // Her satır için
    for (let y = 0; y < 5; y++) {
        // Sol Y koordinatı
        const yLabel = document.createElement('div');
        yLabel.className = 'coord-label';
        yLabel.textContent = y;
        mapGrid.appendChild(yLabel);
        
        // Hücreler
        for (let x = 0; x < 5; x++) {
            const cell = document.createElement('div');
            cell.className = 'map-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.innerHTML = '❓';
            cell.onclick = () => fillCoordinates(x, y);
            mapGrid.appendChild(cell);
        }
    }
}

function fillCoordinates(x, y) {
    if (!gameOver) {
        document.getElementById('xInput').value = x;
        document.getElementById('yInput').value = y;
    }
}

function updateDisplay() {
    document.getElementById('attemptsLeft').textContent = attemptsLeft;
    document.getElementById('guessCount').textContent = guessCount;
    
    // En iyi skoru göster
    const bestScoreEl = document.getElementById('bestScore');
    if (bestScore) {
        bestScoreEl.innerHTML = `🏆 En İyi: ${bestScore.guesses} tahmin, ${bestScore.time}sn<br><small>${bestScore.date}</small>`;
    } else {
        bestScoreEl.innerHTML = '🏆 Henüz rekor yok';
    }
}

function updateCell(x, y, found) {
    const cells = document.querySelectorAll('.map-cell');
    cells.forEach(cell => {
        if (parseInt(cell.dataset.x) === x && parseInt(cell.dataset.y) === y) {
            if (found) {
                cell.classList.add('found');
                cell.innerHTML = '💎';
            } else {
                cell.classList.add('guessed');
                cell.innerHTML = '❌';
            }
        }
    });
}

function makeGuess() {
    if (gameOver) return;

    const xInput = document.getElementById('xInput');
    const yInput = document.getElementById('yInput');
    
    const guessX = parseInt(xInput.value);
    const guessY = parseInt(yInput.value);

    if (isNaN(guessX) || isNaN(guessY) || guessX < 0 || guessX > 4 || guessY < 0 || guessY > 4) {
        showMessage('⚠️ Lütfen 0-4 arası geçerli koordinatlar girin!', 'error');
        return;
    }

    const cellKey = `${guessX},${guessY}`;
    if (guessedCells.has(cellKey)) {
        showMessage('⚠️ Bu koordinatı zaten denediniz!', 'error');
        return;
    }

    guessedCells.add(cellKey);
    guessCount++;
    attemptsLeft--;
    updateDisplay();

    if (guessX === treasureX && guessY === treasureY) {
        updateCell(guessX, guessY, true);
        gameOver = true;
        document.getElementById('guessBtn').disabled = true;
        
        // Süreyi hesapla
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        
        // En iyi skoru kontrol et ve güncelle
        let isNewRecord = false;
        if (!bestScore || guessCount < bestScore.guesses || 
            (guessCount === bestScore.guesses && elapsedTime < bestScore.time)) {
            saveBestScore(guessCount, elapsedTime);
            isNewRecord = true;
        }
        
        updateDisplay();
        
        if (isNewRecord) {
            showMessage(`🎉 YENİ REKOR! ${guessCount} tahminde ${elapsedTime} saniyede buldunuz!`, 'success');
        } else {
            showMessage(`🎉 Tebrikler! ${guessCount} tahminde ${elapsedTime} saniyede buldunuz!`, 'success');
        }
    } else {
        updateCell(guessX, guessY, false);
        
        if (attemptsLeft === 0) {
            showMessage(`❌ Oyun Bitti! Hazine (${treasureX}, ${treasureY}) konumundaydı.`, 'error');
            updateCell(treasureX, treasureY, true);
            gameOver = true;
            document.getElementById('guessBtn').disabled = true;
        } else {
            const distance = Math.abs(guessX - treasureX) + Math.abs(guessY - treasureY);
            showMessage(`🧭 Hazineye uzaklık: ${distance} birim`, 'info');
        }
    }

    xInput.value = '';
    yInput.value = '';
}

function showMessage(text, type) {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = text;
    messageBox.className = 'message-box ' + type;
}

function resetGame() {
    initGame();
}

function setMaxAttempts() {
    const input = document.getElementById('maxAttemptsInput');
    const newMax = parseInt(input.value);
    
    if (isNaN(newMax) || newMax < 1 || newMax > 25) {
        showMessage('⚠️ Lütfen 1-25 arası bir değer girin!', 'error');
        input.value = maxAttempts;
        return;
    }
    
    maxAttempts = newMax;
    showMessage(`✓ Deneme sayısı ${maxAttempts} olarak ayarlandı. Yeni oyun başlatılıyor...`, 'success');
    setTimeout(() => {
        initGame();
    }, 1500);
}

document.getElementById('xInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('yInput').focus();
    }
});

document.getElementById('yInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        makeGuess();
    }
});

initGame();
