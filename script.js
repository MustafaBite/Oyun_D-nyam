// Oyun Durumu
let gameState = {
    mode: null,              // 'single' veya 'multi'
    word: '',                // Tahmin edilecek kelime
    guessedLetters: [],      // Tahmin edilen harfler
    remainingLives: 7,       // Kalan hak (7'ye çıkarıldı)
    gameOver: false,         // Oyun bitti mi?
    startTime: null          // Oyun başlangıç zamanı
};

// En iyi skoru yükle
let bestScore = loadBestScore();

// Tek kişilik mod için kelime listesi
const wordList = [
    'JAVASCRIPT', 'PYTHON', 'PROGRAMLAMA', 'BİLGİSAYAR', 'KLAVYE',
    'FARE', 'EKRAN', 'YAZILIM', 'DONANIM', 'İNTERNET',
    'TARAYICI', 'UYGULAMA', 'VERİTABANI', 'SUNUCU', 'AĞLAR',
    'GÜVENLİK', 'ŞIFRE', 'KULLANICI', 'ARAYÜZ', 'TASARIM'
];

// Adam asmaca parçaları (sırayla gösterilecek) - yüz eklendi
const bodyParts = ['head', 'face', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg'];

// Yüz ifadeleri (her hak kaybında değişecek)
const faceExpressions = [
    { mouth: 'M 120 75 Q 130 80 140 75', eyeSize: 2 },           // 7 hak - Mutlu (gülümseme)
    { mouth: 'M 120 75 Q 130 78 140 75', eyeSize: 2 },           // 6 hak - Hafif gülümseme
    { mouth: 'M 120 76 L 140 76', eyeSize: 2 },                  // 5 hak - Düz ağız
    { mouth: 'M 120 78 Q 130 76 140 78', eyeSize: 2.5 },         // 4 hak - Hafif üzgün
    { mouth: 'M 120 80 Q 130 75 140 80', eyeSize: 3 },           // 3 hak - Üzgün
    { mouth: 'M 120 82 Q 130 73 140 82', eyeSize: 3.5 },         // 2 hak - Çok üzgün
    { mouth: 'M 120 85 Q 130 70 140 85', eyeSize: 4 }            // 1 hak - Dehşet
];

/**
 * En iyi skoru localStorage'dan yükler
 */
function loadBestScore() {
    const saved = localStorage.getItem('adamAsmacaBestScore');
    return saved ? JSON.parse(saved) : null;
}

/**
 * En iyi skoru localStorage'a kaydeder
 */
function saveBestScore(errors, time) {
    const score = { errors, time, date: new Date().toLocaleDateString('tr-TR') };
    localStorage.setItem('adamAsmacaBestScore', JSON.stringify(score));
    bestScore = score;
}

/**
 * Oyunu başlatır - Mod seçimine göre
 */
function startGame(mode) {
    gameState.mode = mode;
    
    // Mod seçimini gizle
    document.getElementById('modeSelection').classList.add('hidden');
    
    if (mode === 'single') {
        // Tek kişilik: Rastgele kelime seç ve oyunu başlat
        gameState.word = wordList[Math.floor(Math.random() * wordList.length)];
        initializeGame();
    } else {
        // Çift kişilik: Kelime girişi göster
        document.getElementById('wordInput').classList.remove('hidden');
        document.getElementById('secretWord').focus();
    }
}

/**
 * Çift kişilik modda gizli kelimeyi ayarlar
 */
function setSecretWord() {
    const input = document.getElementById('secretWord');
    const word = input.value.trim().toUpperCase();
    
    // Kelime kontrolü
    if (word.length < 2) {
        showMessage('Lütfen en az 2 harfli bir kelime girin!', 'error');
        return;
    }
    
    // Sadece harf kontrolü
    if (!/^[A-ZÇĞİÖŞÜ]+$/.test(word)) {
        showMessage('Lütfen sadece harf kullanın!', 'error');
        return;
    }
    
    gameState.word = word;
    document.getElementById('wordInput').classList.add('hidden');
    initializeGame();
}

/**
 * Oyunu başlatır ve arayüzü hazırlar
 */
function initializeGame() {
    // Oyun durumunu sıfırla
    gameState.guessedLetters = [];
    gameState.remainingLives = 7;
    gameState.gameOver = false;
    gameState.startTime = Date.now();
    
    // Oyun alanını göster
    document.getElementById('gameArea').classList.remove('hidden');
    
    // Adam asmaca parçalarını gizle
    bodyParts.forEach(part => {
        document.getElementById(part).classList.remove('visible');
    });
    
    // Yüzü başlangıç durumuna getir (mutlu)
    resetFace();
    
    // Arayüzü güncelle
    updateDisplay();
    updateStats();
    
    // Input'u temizle ve odaklan
    const input = document.getElementById('guessInput');
    input.value = '';
    input.disabled = false;
    input.focus();
    
    // Mesajı temizle
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = 'message';
    
    // Tekrar oyna butonunu gizle
    document.getElementById('restartBtn').classList.add('hidden');
}

/**
 * Yüzü başlangıç durumuna getirir (mutlu)
 */
function resetFace() {
    const leftEye = document.getElementById('leftEye');
    const rightEye = document.getElementById('rightEye');
    const mouth = document.getElementById('mouth');
    const deadEyes = document.getElementById('deadEyes');
    const happyEyes = document.getElementById('happyEyes');
    
    // Normal gözleri göster
    leftEye.style.opacity = '1';
    rightEye.style.opacity = '1';
    leftEye.setAttribute('r', '2');
    rightEye.setAttribute('r', '2');
    
    // Özel gözleri gizle
    deadEyes.style.opacity = '0';
    happyEyes.style.opacity = '0';
    
    // Mutlu ağız
    mouth.setAttribute('d', faceExpressions[0].mouth);
}

/**
 * Kelime görünümünü günceller (_ _ A _ _)
 */
function updateDisplay() {
    const display = gameState.word
        .split('')
        .map(letter => gameState.guessedLetters.includes(letter) ? letter : '_')
        .join(' ');
    
    document.getElementById('wordDisplay').textContent = display;
}

/**
 * İstatistikleri günceller (kalan hak, girilen harfler)
 */
function updateStats() {
    document.getElementById('remainingLives').textContent = gameState.remainingLives;
    document.getElementById('guessedLetters').textContent = 
        gameState.guessedLetters.length > 0 ? gameState.guessedLetters.join(', ') : '-';
    
    // En iyi skoru göster (sadece tek kişilik modda)
    const bestScoreEl = document.getElementById('bestScore');
    if (bestScoreEl && gameState.mode === 'single') {
        if (bestScore) {
            bestScoreEl.innerHTML = `🏆 En İyi: ${bestScore.errors} hata, ${bestScore.time}sn<br><small style="font-size: 0.8em; opacity: 0.8;">${bestScore.date}</small>`;
        } else {
            bestScoreEl.innerHTML = '🏆 Henüz rekor yok';
        }
        bestScoreEl.style.display = 'block';
    } else if (bestScoreEl) {
        bestScoreEl.style.display = 'none';
    }
}

/**
 * Tahmin yapar (harf veya kelime)
 */
function makeGuess() {
    if (gameState.gameOver) return;
    
    const input = document.getElementById('guessInput');
    const guess = input.value.trim().toUpperCase();
    
    // Boş kontrol
    if (!guess) {
        showMessage('Lütfen bir harf veya kelime girin!', 'warning');
        return;
    }
    
    // Sadece harf kontrolü
    if (!/^[A-ZÇĞİÖŞÜ]+$/.test(guess)) {
        showMessage('Lütfen sadece harf kullanın!', 'error');
        return;
    }
    
    // Input'u temizle
    input.value = '';
    
    // Tek harf mi, kelime mi?
    if (guess.length === 1) {
        guessLetter(guess);
    } else {
        guessWord(guess);
    }
}

/**
 * Harf tahmini yapar
 */
function guessLetter(letter) {
    // Daha önce girilmiş mi?
    if (gameState.guessedLetters.includes(letter)) {
        showMessage('Bu harfi zaten denediniz!', 'warning');
        return; // Hak düşürme
    }
    
    // Harfi listeye ekle
    gameState.guessedLetters.push(letter);
    
    // Harf kelimede var mı?
    if (gameState.word.includes(letter)) {
        showMessage('Doğru harf!', 'success');
        updateDisplay();
        checkWin();
    } else {
        showMessage('Yanlış harf!', 'error');
        loseLife();
    }
    
    updateStats();
}

/**
 * Kelime tahmini yapar
 */
function guessWord(word) {
    // Her tahmin 1 hak düşürür
    if (word === gameState.word) {
        // Doğru kelime - tüm harfleri göster
        gameState.guessedLetters = gameState.word.split('');
        updateDisplay();
        updateStats();
        showMessage('Doğru kelime!', 'success');
        checkWin();
    } else {
        showMessage('Yanlış kelime!', 'error');
        loseLife();
    }
}

/**
 * Bir hak kaybeder ve adam asmacayı günceller
 */
function loseLife() {
    gameState.remainingLives--;
    
    // Adam asmaca parçasını göster
    const partIndex = 7 - gameState.remainingLives - 1;
    if (partIndex >= 0 && partIndex < bodyParts.length) {
        document.getElementById(bodyParts[partIndex]).classList.add('visible');
    }
    
    // Yüz ifadesini güncelle (üzülsün)
    updateFaceExpression();
    
    updateStats();
    
    // Haklar bitti mi?
    if (gameState.remainingLives === 0) {
        gameLose();
    }
}

/**
 * Yüz ifadesini kalan hak sayısına göre günceller
 */
function updateFaceExpression() {
    const expressionIndex = 7 - gameState.remainingLives;
    
    if (expressionIndex >= 0 && expressionIndex < faceExpressions.length) {
        const expression = faceExpressions[expressionIndex];
        const leftEye = document.getElementById('leftEye');
        const rightEye = document.getElementById('rightEye');
        const mouth = document.getElementById('mouth');
        
        // Gözleri büyüt (korku/üzüntü)
        leftEye.setAttribute('r', expression.eyeSize);
        rightEye.setAttribute('r', expression.eyeSize);
        
        // Ağzı değiştir
        mouth.setAttribute('d', expression.mouth);
    }
}

/**
 * Kazanma kontrolü yapar
 */
function checkWin() {
    const allLettersGuessed = gameState.word
        .split('')
        .every(letter => gameState.guessedLetters.includes(letter));
    
    if (allLettersGuessed) {
        gameWin();
    }
}

/**
 * Oyunu kazanır
 */
function gameWin() {
    gameState.gameOver = true;
    
    // Yüzü sevinçli yap
    showHappyFace();
    
    // Tek kişilik modda skor kaydet
    if (gameState.mode === 'single') {
        const errors = 7 - gameState.remainingLives;
        const elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);
        
        let isNewRecord = false;
        if (!bestScore || errors < bestScore.errors || 
            (errors === bestScore.errors && elapsedTime < bestScore.time)) {
            saveBestScore(errors, elapsedTime);
            isNewRecord = true;
        }
        
        if (isNewRecord) {
            showMessage(`🎉 YENİ REKOR! ${errors} hata ile ${elapsedTime} saniyede kazandınız!`, 'success');
        } else {
            showMessage(`🎉 Tebrikler! ${errors} hata ile ${elapsedTime} saniyede kazandınız!`, 'success');
        }
        
        updateStats();
    } else {
        showMessage('🎉 Tebrikler, kazandınız! 🎉', 'success');
    }
    
    endGame();
}

/**
 * Sevinçli yüz gösterir
 */
function showHappyFace() {
    const leftEye = document.getElementById('leftEye');
    const rightEye = document.getElementById('rightEye');
    const mouth = document.getElementById('mouth');
    const happyEyes = document.getElementById('happyEyes');
    
    // Normal gözleri gizle
    leftEye.style.opacity = '0';
    rightEye.style.opacity = '0';
    
    // Sevinç gözlerini göster (kapalı gözler)
    happyEyes.style.opacity = '1';
    
    // Büyük gülümseme
    mouth.setAttribute('d', 'M 118 75 Q 130 85 142 75');
}

/**
 * Oyunu kaybeder
 */
function gameLose() {
    gameState.gameOver = true;
    
    // Yüzü ölü yap (çarpı gözler)
    showDeadFace();
    
    // Kelimeyi göster
    gameState.guessedLetters = gameState.word.split('');
    updateDisplay();
    
    showMessage(`💀 Adam asıldı, kaybettiniz! Kelime: ${gameState.word}`, 'error');
    endGame();
}

/**
 * Ölü yüz gösterir (çarpı gözler)
 */
function showDeadFace() {
    const leftEye = document.getElementById('leftEye');
    const rightEye = document.getElementById('rightEye');
    const mouth = document.getElementById('mouth');
    const deadEyes = document.getElementById('deadEyes');
    
    // Normal gözleri gizle
    leftEye.style.opacity = '0';
    rightEye.style.opacity = '0';
    
    // Çarpı gözleri göster
    deadEyes.style.opacity = '1';
    
    // Ağzı aç (çığlık)
    mouth.setAttribute('d', 'M 125 78 Q 130 83 135 78 Q 130 88 125 78');
}

/**
 * Oyunu bitirir ve tekrar oyna butonunu gösterir
 */
function endGame() {
    document.getElementById('guessInput').disabled = true;
    document.getElementById('restartBtn').classList.remove('hidden');
}

/**
 * Mesaj gösterir
 */
function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
}

/**
 * Oyunu yeniden başlatır
 */
function restartGame() {
    // Tüm alanları gizle
    document.getElementById('gameArea').classList.add('hidden');
    document.getElementById('wordInput').classList.add('hidden');
    
    // Mod seçimini göster
    document.getElementById('modeSelection').classList.remove('hidden');
    
    // Kelime input'unu temizle
    document.getElementById('secretWord').value = '';
}

// Enter tuşu ile tahmin yapma
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('guessInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            makeGuess();
        }
    });
    
    document.getElementById('secretWord').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            setSecretWord();
        }
    });
});
