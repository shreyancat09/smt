document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("breakoutCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // HUD elements
  const scoreDisplay = document.getElementById("arcadeScore");
  const livesDisplay = document.getElementById("arcadeLives");
  const highScoreDisplay = document.getElementById("arcadeHighScore");
  const overlay = document.getElementById("arcadeOverlay");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlaySub = document.getElementById("overlaySub");
  const overlayActionBtn = document.getElementById("overlayActionBtn");
  const pauseBtn = document.getElementById("pauseArcadeBtn");
  const resetBtn = document.getElementById("resetArcadeBtn");

  // Web Audio Synth for sound effects
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  function playTone(freq, type, duration, gainVal = 0.08) {
    try {
      if (!audioCtx) audioCtx = new AudioContext();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  const sfx = {
    paddle: () => playTone(300, "triangle", 0.08),
    brick: (pitch) => playTone(pitch || 520, "sine", 0.09),
    powerup: () => {
      playTone(550, "square", 0.08);
      setTimeout(() => playTone(880, "square", 0.12), 60);
    },
    loseLife: () => playTone(160, "sawtooth", 0.3, 0.12),
    win: () => {
      [523, 659, 784, 1046].forEach((f, i) => {
        setTimeout(() => playTone(f, "triangle", 0.14), i * 90);
      });
    }
  };

  // State
  let score = 0;
  let lives = 3;
  let gameState = "IDLE"; // IDLE, PLAYING, PAUSED, OVER, WON
  let highScore = parseInt(localStorage.getItem("tuition_breakout_high") || "0", 10);
  highScoreDisplay.textContent = highScore;

  // Paddle
  const paddle = {
    w: 110,
    h: 14,
    x: (canvas.width - 110) / 2,
    y: canvas.height - 30,
    speed: 9
  };

  // Balls array (supports Multi-Ball powerup)
  let balls = [];

  function spawnBall(x, y, dx, dy) {
    balls.push({
      x: x || paddle.x + paddle.w / 2,
      y: y || paddle.y - 10,
      r: 6,
      dx: dx || (Math.random() > 0.5 ? 4.5 : -4.5),
      dy: dy || -5
    });
  }

  // Bricks Grid
  const brickRows = 5;
  const brickCols = 8;
  const brickPadding = 8;
  const brickOffsetTop = 50;
  const brickOffsetLeft = 32;
  const brickWidth = 76;
  const brickHeight = 22;

  const rowColors = [
    { fill: "#ef4444", points: 50 },
    { fill: "#f97316", points: 40 },
    { fill: "#eab308", points: 30 },
    { fill: "#10b981", points: 20 },
    { fill: "#3b82f6", points: 10 }
  ];

  let bricks = [];

  function initBricks() {
    bricks = [];
    for (let r = 0; r < brickRows; r++) {
      bricks[r] = [];
      for (let c = 0; c < brickCols; c++) {
        bricks[r][c] = {
          x: c * (brickWidth + brickPadding) + brickOffsetLeft,
          y: r * (brickHeight + brickPadding) + brickOffsetTop,
          status: 1,
          color: rowColors[r].fill,
          points: rowColors[r].points
        };
      }
    }
  }

  // Particles
  let particles = [];

  function createExplosion(x, y, color) {
    for (let i = 0; i < 8; i++) {
      particles.push({
        x: x,
        y: y,
        dx: (Math.random() - 0.5) * 6,
        dy: (Math.random() - 0.5) * 6,
        r: Math.random() * 3 + 1,
        color: color,
        life: 20
      });
    }
  }

  // Power-ups
  let powerups = [];
  const POWERUP_TYPES = [
    { label: "+BALL", type: "multiball", color: "#38bdf8" },
    { label: "WIDE", type: "wide", color: "#4ade80" },
    { label: "+LIFE", type: "life", color: "#f43f5e" }
  ];

  function maybeDropPowerup(x, y) {
    if (Math.random() < 0.22) {
      const p = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
      powerups.push({
        x: x + brickWidth / 2,
        y: y,
        type: p.type,
        label: p.label,
        color: p.color,
        w: 48,
        h: 18,
        dy: 2.2
      });
    }
  }

  // Controls
  let rightPressed = false;
  let leftPressed = false;

  document.addEventListener("keydown", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") rightPressed = true;
    if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") leftPressed = true;
    if (e.code === "Space" && gameState === "PLAYING") togglePause();
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") rightPressed = false;
    if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") leftPressed = false;
  });

  function handlePointerMove(clientX) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const canvasX = (clientX - rect.left) * scaleX;
    paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, canvasX - paddle.w / 2));
  }

  canvas.addEventListener("mousemove", (e) => handlePointerMove(e.clientX));
  canvas.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
      handlePointerMove(e.touches[0].clientX);
      e.preventDefault();
    }
  }, { passive: false });

  // Game flow
  function startNewGame() {
    score = 0;
    lives = 3;
    paddle.w = 110;
    paddle.x = (canvas.width - paddle.w) / 2;
    balls = [];
    powerups = [];
    particles = [];
    spawnBall();
    initBricks();
    updateHUD();

    overlay.style.display = "none";
    gameState = "PLAYING";
  }

  function togglePause() {
    if (gameState === "PLAYING") {
      gameState = "PAUSED";
      overlayTitle.textContent = "GAME PAUSED";
      overlaySub.textContent = "Take a breath. Press resume when you are ready.";
      overlayActionBtn.textContent = "Resume Game";
      overlay.style.display = "flex";
      pauseBtn.textContent = "Resume";
    } else if (gameState === "PAUSED") {
      gameState = "PLAYING";
      overlay.style.display = "none";
      pauseBtn.textContent = "Pause";
    }
  }

  function gameOver() {
    gameState = "OVER";
    sfx.loseLife();
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("tuition_breakout_high", highScore.toString());
      highScoreDisplay.textContent = highScore;
    }
    overlayTitle.textContent = "GAME OVER";
    overlaySub.textContent = `Score: ${score} pts. Head clear? Ready for another round?`;
    overlayActionBtn.textContent = "Play Again";
    overlay.style.display = "flex";
  }

  function gameWon() {
    gameState = "WON";
    sfx.win();
    score += lives * 100;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("tuition_breakout_high", highScore.toString());
      highScoreDisplay.textContent = highScore;
    }
    overlayTitle.textContent = "BOARD CLEARED! 🏆";
    overlaySub.textContent = `Nice reflexes! Final Score: ${score} pts.`;
    overlayActionBtn.textContent = "Next Round";
    overlay.style.display = "flex";
  }

  function updateHUD() {
    scoreDisplay.textContent = score;
    let heartStr = "";
    for (let i = 0; i < lives; i++) heartStr += "❤️";
    livesDisplay.textContent = heartStr || "💀";
  }

  // Update step
  function update() {
    if (gameState !== "PLAYING") return;

    if (rightPressed && paddle.x < canvas.width - paddle.w) paddle.x += paddle.speed;
    if (leftPressed && paddle.x > 0) paddle.x -= paddle.speed;

    // Balls loop
    for (let i = balls.length - 1; i >= 0; i--) {
      const b = balls[i];
      b.x += b.dx;
      b.y += b.dy;

      // Walls
      if (b.x + b.r > canvas.width || b.x - b.r < 0) {
        b.dx = -b.dx;
        sfx.paddle();
      }
      if (b.y - b.r < 0) {
        b.dy = -b.dy;
        sfx.paddle();
      }

      // Paddle strike
      if (
        b.y + b.r >= paddle.y &&
        b.y - b.r <= paddle.y + paddle.h &&
        b.x >= paddle.x &&
        b.x <= paddle.x + paddle.w &&
        b.dy > 0
      ) {
        sfx.paddle();
        const hitPoint = (b.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
        const maxAngle = Math.PI / 3;
        const angle = hitPoint * maxAngle;
        const currentSpeed = Math.sqrt(b.dx * b.dx + b.dy * b.dy);
        b.dx = currentSpeed * Math.sin(angle);
        b.dy = -currentSpeed * Math.cos(angle);
      }

      // Bricks
      let remainingBricks = 0;
      for (let r = 0; r < brickRows; r++) {
        for (let c = 0; c < brickCols; c++) {
          const brk = bricks[r][c];
          if (brk.status === 1) {
            remainingBricks++;
            if (
              b.x + b.r > brk.x &&
              b.x - b.r < brk.x + brickWidth &&
              b.y + b.r > brk.y &&
              b.y - b.r < brk.y + brickHeight
            ) {
              b.dy = -b.dy;
              brk.status = 0;
              score += brk.points;
              updateHUD();
              createExplosion(brk.x + brickWidth / 2, brk.y + brickHeight / 2, brk.color);
              sfx.brick(420 + r * 65);
              maybeDropPowerup(brk.x, brk.y);
            }
          }
        }
      }

      if (remainingBricks === 0) {
        gameWon();
        return;
      }

      // Bottom boundary
      if (b.y - b.r > canvas.height) {
        balls.splice(i, 1);
      }
    }

    // Ball loss
    if (balls.length === 0) {
      lives--;
      updateHUD();
      sfx.loseLife();
      if (lives <= 0) {
        gameOver();
      } else {
        paddle.w = 110;
        spawnBall();
      }
    }

    // Power-ups
    for (let p = powerups.length - 1; p >= 0; p--) {
      const pow = powerups[p];
      pow.y += pow.dy;

      if (
        pow.y + pow.h >= paddle.y &&
        pow.y <= paddle.y + paddle.h &&
        pow.x + pow.w / 2 >= paddle.x &&
        pow.x - pow.w / 2 <= paddle.x + paddle.w
      ) {
        sfx.powerup();
        if (pow.type === "multiball") {
          spawnBall(paddle.x + paddle.w / 2, paddle.y - 10, -4, -5);
          spawnBall(paddle.x + paddle.w / 2, paddle.y - 10, 4, -5);
        } else if (pow.type === "wide") {
          paddle.w = Math.min(canvas.width * 0.4, paddle.w + 35);
        } else if (pow.type === "life") {
          lives = Math.min(5, lives + 1);
          updateHUD();
        }
        powerups.splice(p, 1);
      } else if (pow.y > canvas.height) {
        powerups.splice(p, 1);
      }
    }

    // Particles
    for (let pt = particles.length - 1; pt >= 0; pt--) {
      const prt = particles[pt];
      prt.x += prt.dx;
      prt.y += prt.dy;
      prt.life--;
      if (prt.life <= 0) particles.splice(pt, 1);
    }
  }

  // Draw step
  function draw() {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Bricks
    for (let r = 0; r < brickRows; r++) {
      for (let c = 0; c < brickCols; c++) {
        const brk = bricks[r] && bricks[r][c];
        if (brk && brk.status === 1) {
          ctx.fillStyle = brk.color;
          ctx.beginPath();
          ctx.roundRect(brk.x, brk.y, brickWidth, brickHeight, 4);
          ctx.fill();

          ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
          ctx.fillRect(brk.x, brk.y, brickWidth, 3);
        }
      }
    }

    // Paddle
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 6);
    ctx.fill();

    // Balls
    ctx.fillStyle = "#f8fafc";
    balls.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Power-ups
    powerups.forEach(pow => {
      ctx.fillStyle = pow.color;
      ctx.beginPath();
      ctx.roundRect(pow.x - pow.w / 2, pow.y, pow.w, pow.h, 4);
      ctx.fill();

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 10px 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(pow.label, pow.x, pow.y + 13);
    });

    // Particles
    particles.forEach(pt => {
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }

  // Bindings
  overlayActionBtn.addEventListener("click", () => {
    if (gameState === "PAUSED") togglePause();
    else startNewGame();
  });

  pauseBtn.addEventListener("click", togglePause);
  resetBtn.addEventListener("click", startNewGame);

  initBricks();
  draw();
  requestAnimationFrame(gameLoop);
});
