const player = document.getElementById("player");
const obstacle = document.getElementById("obstacle");
const timeText = document.getElementById("time");
const bestScoreText = document.getElementById("bestScore");
const gameOverScreen = document.getElementById("gameOverScreen");
const startText = document.getElementById("startText");
const game = document.getElementById("game");

let isJumping = false;
let position = 0;

let gravity = 0.6;
let jumpPower = 12;

let gameStarted = false;
let gameOverFlag = false;

let speed = 5;
let obstaclePosition = 800;

let time = 0;
let lastColorChange = 0;

let bestScore = localStorage.getItem("bestScore") || 0;
bestScoreText.innerText = bestScore;

// 🐱 yürüyüş hissi
const walkFrames = ["🐱", "😺"];
let walkIndex = 0;

// 🎨 RENK HAVUZLARI (RANDOM)
const gameBackgrounds = [
  "#000000", "#1a1a1a", "#2c003e", "#001f3f",
  "#0b3d2e", "#3d0000", "#2e1a00"
];

const obstacleColors = [
  "#ffffff", "#ffcc00", "#00ffff",
  "#ff4d4d", "#7fff00", "#ff66ff"
];

const screenColors = [
  "#f5f5f5",   // açık gri
  "#eaeaea",   // gri
  "#fff3cd",   // açık sarı
  "#e3f2fd",   // açık mavi
  "#e8f5e9",   // açık yeşil
  "#fce4ec",   // açık pembe
  "#ede7f6"    // açık mor
];


// 🐱 yürüyüş animasyonu
setInterval(() => {
  if (gameStarted && !isJumping && !gameOverFlag) {
    player.innerText = walkFrames[walkIndex % walkFrames.length];
    walkIndex++;
  }
}, 200);

// 🎮 Klavye
document.addEventListener("keydown", () => {
  startGameOrJump();
});

// 📱 Mobil
document.addEventListener("touchstart", () => {
  startGameOrJump();
});

function startGameOrJump() {
  if (!gameStarted) {
    gameStarted = true;
    if (startText) startText.style.display = "none";
    applyRandomTheme(); // oyun başında random tema
  } else if (!isJumping && !gameOverFlag) {
    jump();
  }
}

// 🐱 Zıplama
function jump() {
  isJumping = true;
  let velocity = jumpPower;

  let jumpInterval = setInterval(() => {
    position += velocity;
    velocity -= gravity;

    if (position <= 0) {
      position = 0;
      isJumping = false;
      clearInterval(jumpInterval);
    }

    player.style.bottom = position + "px";
  }, 20);
}

// 🚧 Engel + hız
setInterval(() => {
  if (!gameStarted || gameOverFlag) return;

  obstaclePosition -= speed;
  obstacle.style.left = obstaclePosition + "px";

  if (obstaclePosition < -40) {
    obstaclePosition = 800;

    // ⛔ 58. saniyeden sonra hız artmasın
    if (time < 58) {
      speed += 0.4;
    }
  }

  // Çarpışma
  if (
    obstaclePosition > 60 &&
    obstaclePosition < 100 &&
    position < 35
  ) {
    endGame();
  }
}, 20);

// ⏱ Süre + renk değişimi
setInterval(() => {
  if (gameStarted && !gameOverFlag) {
    time++;
    timeText.innerText = time;

    // 🎨 Her 50 saniyede bir tema değiştir
    if (time % 21 === 0 && time !== lastColorChange) {
      lastColorChange = time;
      applyRandomTheme();
    }
  }
}, 1000);

// 🎨 Tema uygulama
function applyRandomTheme() {
  const bg = gameBackgrounds[Math.floor(Math.random() * gameBackgrounds.length)];
  const obs = obstacleColors[Math.floor(Math.random() * obstacleColors.length)];
  const screen = screenColors[Math.floor(Math.random() * screenColors.length)];

  game.style.backgroundColor = bg;
  obstacle.style.backgroundColor = obs;
  document.body.style.backgroundColor = screen;
}

// 💥 Oyun bitti
function endGame() {
  gameOverFlag = true;
  gameOverScreen.style.display = "flex";

  if (time > bestScore) {
    bestScore = time;
    localStorage.setItem("bestScore", bestScore);
  }

  bestScoreText.innerText = bestScore;
}

// 🔄 Reset
function resetGame() {
  location.reload();
}
