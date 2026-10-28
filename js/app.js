/* ==========================================================================
   TUITION STUDY PORTAL - MASTER ENGINE
   ========================================================================== */

// 1. Master Roster: All 35 Students UNLOCKED by default
const DEFAULT_STUDENTS = {
  "abir": { name: "Abir", pin: "4821", feesPaid: true, pendingMonths: "" },
  "adrita": { name: "Adrita", pin: "7394", feesPaid: true, pendingMonths: "" },
  "anushtup": { name: "Anushtup", pin: "1658", feesPaid: true, pendingMonths: "" },
  "arkadeep": { name: "Arkadeep", pin: "8243", feesPaid: true, pendingMonths: "" },
  "arpan": { name: "Arpan", pin: "3912", feesPaid: true, pendingMonths: "" },
  "ayushman": { name: "Ayushman", pin: "6547", feesPaid: true, pendingMonths: "" },
  "bivabsu": { name: "Bivabsu", pin: "2891", feesPaid: true, pendingMonths: "" },
  "debadrita": { name: "Debadrita", pin: "5174", feesPaid: true, pendingMonths: "" },
  "dibya": { name: "Dibya", pin: "9432", feesPaid: true, pendingMonths: "" },
  "hridisha": { name: "Hridisha", pin: "3765", feesPaid: true, pendingMonths: "" },
  "kinjal": { name: "Kinjal", pin: "8129", feesPaid: true, pendingMonths: "" },
  "kaustav": { name: "Kaustav", pin: "6284", feesPaid: true, pendingMonths: "" },
  "niladri": { name: "Niladri", pin: "1947", feesPaid: true, pendingMonths: "" },
  "priyankshu": { name: "Priyankshu", pin: "5382", feesPaid: true, pendingMonths: "" },
  "progyan": { name: "Progyan", pin: "7461", feesPaid: true, pendingMonths: "" },
  "rahi": { name: "Rahi", pin: "2398", feesPaid: true, pendingMonths: "" },
  "rajdip": { name: "Rajdip", pin: "8715", feesPaid: true, pendingMonths: "" },
  "rishita": { name: "Rishita", pin: "4629", feesPaid: true, pendingMonths: "" },
  "rishav": { name: "Rishav", pin: "9153", feesPaid: true, pendingMonths: "" },
  "ritam": { name: "Ritam", pin: "3482", feesPaid: true, pendingMonths: "" },
  "rijoy": { name: "Rijoy", pin: "6721", feesPaid: true, pendingMonths: "" },
  "sampriti": { name: "Sampriti", pin: "5834", feesPaid: true, pendingMonths: "" },
  "sampurna": { name: "Sampurna", pin: "1295", feesPaid: true, pendingMonths: "" },
  "saif": { name: "Saif", pin: "7649", feesPaid: true, pendingMonths: "" },
  "shahina": { name: "Shahina", pin: "3187", feesPaid: true, pendingMonths: "" },
  "shruti": { name: "Shruti", pin: "9542", feesPaid: true, pendingMonths: "" },
  "soumyajyoti": { name: "Soumyajyoti", pin: "4218", feesPaid: true, pendingMonths: "" },
  "soujanya": { name: "Soujanya", pin: "6831", feesPaid: true, pendingMonths: "" },
  "sucharita": { name: "Sucharita", pin: "8374", feesPaid: true, pendingMonths: "" },
  "surjo": { name: "Surjo", pin: "2956", feesPaid: true, pendingMonths: "" },
  "surottam": { name: "Surottam", pin: "5419", feesPaid: true, pendingMonths: "" },
  "aleeza": { name: "Aleeza", pin: "7163", feesPaid: true, pendingMonths: "" },
  "abhiraj": { name: "Abhiraj", pin: "3825", feesPaid: true, pendingMonths: "" },
  "ayan": { name: "Ayan", pin: "8492", feesPaid: true, pendingMonths: "" },
  "adhiraj": { name: "Adhiraj", pin: "1736", feesPaid: true, pendingMonths: "" },
  "admin": { name: "Instructor", pin: "9988", feesPaid: true, pendingMonths: "" }
};

function getRoster() {
  const saved = localStorage.getItem("tuition_roster_v3");
  if (!saved) {
    localStorage.setItem("tuition_roster_v3", JSON.stringify(DEFAULT_STUDENTS));
    return DEFAULT_STUDENTS;
  }
  return JSON.parse(saved);
}

function getSession() {
  const s = localStorage.getItem("tuition_session_v3");
  return s ? JSON.parse(s) : null;
}

// 2. Tab Navigation Switcher (Zero 404s)
function switchTab(tabId) {
  const session = getSession();
  // If student is fee-locked, keep them on Home lock view
  if (session && !session.feesPaid && tabId !== "tab-home" && tabId !== "tab-contact") {
    alert("Access paused. Please clear batch dues to view this section.");
    return;
  }

  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".nav-tab-btn").forEach(el => el.classList.remove("active"));

  const targetTab = document.getElementById(tabId);
  const targetBtn = document.querySelector(`[data-tab="${tabId}"]`);
  if (targetTab) targetTab.classList.add("active");
  if (targetBtn) targetBtn.classList.add("active");

  // Load PDF when switching to paper viewer tab
  if (tabId === "tab-paper") {
    initPDFViewer();
  }
}

// 3. Dark Theme Management
function initTheme() {
  const t = localStorage.getItem("tuition_theme") || "light";
  document.documentElement.setAttribute("data-theme", t);
  const btn = document.getElementById("themeToggleBtn");
  if (btn) btn.textContent = t === "dark" ? "☀️ Light" : "🌙 Dark";
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme") || "light";
  const next = cur === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("tuition_theme", next);
  const btn = document.getElementById("themeToggleBtn");
  if (btn) btn.textContent = next === "dark" ? "☀️ Light" : "🌙 Dark";
}

// 4. Session Validation & Fee Lock Renderer
function checkAuthAndRender() {
  const session = getSession();
  const loginScreen = document.getElementById("loginScreen");
  const portalScreen = document.getElementById("portalScreen");

  if (!session) {
    loginScreen.style.display = "flex";
    portalScreen.style.display = "none";
    return;
  }

  loginScreen.style.display = "none";
  portalScreen.style.display = "block";

  // Update user tags
  document.querySelectorAll("#studentDisplay, #securityStudentTag").forEach(el => el.textContent = session.name);
  const greet = document.getElementById("welcomeGreeting");
  if (greet) greet.textContent = `Welcome back, ${session.name}!`;

  // Apply Fee Lock if student is marked unpaid
  const homeUnlocked = document.getElementById("homeUnlockedView");
  const feeCard = document.getElementById("feeLockScreen");
  const feeMsg = document.getElementById("feeLockMessage");

  if (session.feesPaid) {
    if (homeUnlocked) homeUnlocked.style.display = "block";
    if (feeCard) feeCard.style.display = "none";
  } else {
    if (homeUnlocked) homeUnlocked.style.display = "none";
    if (feeCard) feeCard.style.display = "block";
    if (feeMsg) {
      feeMsg.innerHTML = `Hello <strong>${session.name}</strong>, your evaluation portal is temporarily on hold because fees for <strong>${session.pendingMonths || "recent months"}</strong> are pending.<br><br>Please clear dues with Swati Ma'am to unlock.`;
    }
  }
}

// 5. Anti-Download & Dynamic Watermark Canvas PDF Viewer
let pdfDoc = null;
let currentPage = 1;
let zoom = 1.0;

async function initPDFViewer() {
  if (typeof pdfjsLib === "undefined") return;
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  const docCanvas = document.getElementById("documentCanvas");
  const markCanvas = document.getElementById("watermarkCanvas");
  if (!docCanvas || !markCanvas) return;

  const docCtx = docCanvas.getContext("2d");
  const markCtx = markCanvas.getContext("2d");
  const session = getSession() || { name: "Student" };

  try {
    const pdfPath = `./papers/weekly.pdf?t=${Date.now()}`;
    const loadingTask = pdfjsLib.getDocument(pdfPath);
    pdfDoc = await loadingTask.promise;
    document.getElementById("totalPagesNum").textContent = pdfDoc.numPages;
    renderPDFPage(currentPage, docCanvas, markCanvas, docCtx, markCtx, session);
  } catch (e) {
    docCanvas.width = 600;
    docCanvas.height = 300;
    docCtx.fillStyle = "#ffffff";
    docCtx.fillRect(0, 0, 600, 300);
    docCtx.fillStyle = "#64748b";
    docCtx.font = "16px sans-serif";
    docCtx.textAlign = "center";
    docCtx.fillText("Weekly evaluation paper will be uploaded soon.", 300, 150);
  }
}

async function renderPDFPage(pageNum, docCanvas, markCanvas, docCtx, markCtx, session) {
  if (!pdfDoc) return;
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: zoom * 1.4 });

  docCanvas.width = viewport.width;
  docCanvas.height = viewport.height;
  markCanvas.width = viewport.width;
  markCanvas.height = viewport.height;

  await page.render({ canvasContext: docCtx, viewport: viewport }).promise;

  // Stamped watermark: ONLY Student Name & Confidentiality (NO PIN, NO CLASS)
  markCtx.clearRect(0, 0, markCanvas.width, markCanvas.height);
  markCtx.save();
  markCtx.rotate((-25 * Math.PI) / 180);
  markCtx.font = "bold 20px sans-serif";
  markCtx.fillStyle = "rgba(220, 38, 38, 0.13)";
  markCtx.textAlign = "center";

  const watermarkString = `${session.name.toUpperCase()} • PRIVATE ASSESSMENT • CONFIDENTIAL`;
  for (let x = -markCanvas.width; x < markCanvas.width * 2; x += 320) {
    for (let y = -markCanvas.height; y < markCanvas.height * 2; y += 180) {
      markCtx.fillText(watermarkString, x, y);
    }
  }
  markCtx.restore();
}

// 6. Breakout Arcade
function initBreakout() {
  const canvas = document.getElementById("breakoutCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const scoreDisplay = document.getElementById("arcadeScore");
  const livesDisplay = document.getElementById("arcadeLives");
  const highScoreDisplay = document.getElementById("arcadeHighScore");
  const overlay = document.getElementById("arcadeOverlay");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlaySub = document.getElementById("overlaySub");
  const overlayBtn = document.getElementById("overlayActionBtn");

  let score = 0;
  let lives = 3;
  let gameState = "IDLE";
  let highScore = parseInt(localStorage.getItem("tuition_high_score") || "0", 10);
  highScoreDisplay.textContent = highScore;

  const paddle = { w: 110, h: 14, x: (canvas.width - 110) / 2, y: canvas.height - 30, speed: 8 };
  let balls = [];

  function spawnBall() {
    balls = [{ x: paddle.x + paddle.w / 2, y: paddle.y - 10, r: 6, dx: 4.5, dy: -4.5 }];
  }

  let bricks = [];
  function setupBricks() {
    bricks = [];
    const colors = ["#ef4444", "#f97316", "#eab308", "#10b981", "#3b82f6"];
    for (let r = 0; r < 5; r++) {
      bricks[r] = [];
      for (let c = 0; c < 8; c++) {
        bricks[r][c] = { x: c * 84 + 32, y: r * 28 + 45, status: 1, color: colors[r], pts: (5 - r) * 10 };
      }
    }
  }

  function handlePointer(clientX) {
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    paddle.x = Math.max(0, Math.min(canvas.width - paddle.w, (clientX - rect.left) * scale - paddle.w / 2));
  }

  canvas.addEventListener("mousemove", (e) => handlePointer(e.clientX));
  canvas.addEventListener("touchmove", (e) => {
    if (e.touches.length) handlePointer(e.touches[0].clientX);
  });

  function gameLoop() {
    if (gameState === "PLAYING") {
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Bricks
      let active = 0;
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 8; c++) {
          const b = bricks[r][c];
          if (b.status === 1) {
            active++;
            ctx.fillStyle = b.color;
            ctx.fillRect(b.x, b.y, 76, 20);
          }
        }
      }

      // Draw Paddle
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

      // Move & Draw Balls
      balls.forEach((b, idx) => {
        b.x += b.dx;
        b.y += b.dy;

        if (b.x + b.r > canvas.width || b.x - b.r < 0) b.dx = -b.dx;
        if (b.y - b.r < 0) b.dy = -b.dy;

        // Paddle hit
        if (b.y + b.r >= paddle.y && b.x >= paddle.x && b.x <= paddle.x + paddle.w && b.dy > 0) {
          b.dy = -b.dy;
        }

        // Brick hit
        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < 8; c++) {
            const brk = bricks[r][c];
            if (brk.status === 1 && b.x > brk.x && b.x < brk.x + 76 && b.y > brk.y && b.y < brk.y + 20) {
              b.dy = -b.dy;
              brk.status = 0;
              score += brk.pts;
              scoreDisplay.textContent = score;
            }
          }
        }

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();

        if (b.y > canvas.height) balls.splice(idx, 1);
      });

      if (balls.length === 0) {
        lives--;
        livesDisplay.textContent = "❤️".repeat(Math.max(0, lives)) || "💀";
        if (lives <= 0) {
          gameState = "OVER";
          if (score > highScore) {
            highScore = score;
            localStorage.setItem("tuition_high_score", highScore);
            highScoreDisplay.textContent = highScore;
          }
          overlayTitle.textContent = "GAME OVER";
          overlaySub.textContent = `Score: ${score} pts. Ready for another round?`;
          overlayBtn.textContent = "Play Again";
          overlay.style.display = "flex";
        } else {
          spawnBall();
        }
      }

      if (active === 0) {
        gameState = "WON";
        overlayTitle.textContent = "BOARD CLEARED! 🏆";
        overlaySub.textContent = `Excellent reflexes! Final Score: ${score} pts.`;
        overlay.style.display = "flex";
      }
    }
    requestAnimationFrame(gameLoop);
  }

  overlayBtn.addEventListener("click", () => {
    score = 0;
    lives = 3;
    scoreDisplay.textContent = "0";
    livesDisplay.textContent = "❤️❤️❤️";
    overlay.style.display = "none";
    paddle.x = (canvas.width - paddle.w) / 2;
    spawnBall();
    setupBricks();
    gameState = "PLAYING";
  });

  document.getElementById("pauseArcadeBtn").addEventListener("click", () => {
    if (gameState === "PLAYING") {
      gameState = "PAUSED";
      overlayTitle.textContent = "PAUSED";
      overlaySub.textContent = "Game paused. Tap resume to jump back in.";
      overlayBtn.textContent = "Resume";
      overlay.style.display = "flex";
    }
  });

  document.getElementById("resetArcadeBtn").addEventListener("click", () => {
    overlayBtn.click();
  });

  setupBricks();
  gameLoop();
}

// 7. Security Blurring & Shortcuts Blocker
function initSecurity() {
  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && ["p", "s", "u"].includes(e.key.toLowerCase())) {
      e.preventDefault();
      alert("Copying and printing are disabled.");
    }
  });

  const blurShield = document.getElementById("securityBlurScreen");
  window.addEventListener("blur", () => { if (blurShield) blurShield.style.display = "flex"; });
  window.addEventListener("focus", () => { if (blurShield) blurShield.style.display = "none"; });
  document.addEventListener("visibilitychange", () => {
    if (blurShield) blurShield.style.display = document.visibilityState === "hidden" ? "flex" : "none";
  });
}

// 8. Event Initialization
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initSecurity();
  checkAuthAndRender();
  initBreakout();

  const themeBtn = document.getElementById("themeToggleBtn");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

  // Nav Tab clicks
  document.querySelectorAll(".nav-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.getAttribute("data-tab")));
  });

  // Zoom buttons
  const zoomIn = document.getElementById("zoomInBtn");
  const zoomOut = document.getElementById("zoomOutBtn");
  if (zoomIn) zoomIn.addEventListener("click", () => { if (zoom < 1.4) { zoom += 0.1; document.getElementById("zoomLevel").textContent = `${Math.round(zoom * 100)}%`; initPDFViewer(); } });
  if (zoomOut) zoomOut.addEventListener("click", () => { if (zoom > 0.8) { zoom -= 0.1; document.getElementById("zoomLevel").textContent = `${Math.round(zoom * 100)}%`; initPDFViewer(); } });

  // Page Switchers
  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");
  if (prevBtn) prevBtn.addEventListener("click", () => { if (currentPage > 1) { currentPage--; document.getElementById("currentPageNum").textContent = currentPage; initPDFViewer(); } });
  if (nextBtn) nextBtn.addEventListener("click", () => { if (pdfDoc && currentPage < pdfDoc.numPages) { currentPage++; document.getElementById("currentPageNum").textContent = currentPage; initPDFViewer(); } });

  // Login Form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("studentName").value.trim().toLowerCase();
      const pass = document.getElementById("studentPass").value.trim();
      const err = document.getElementById("authError");

      const roster = getRoster();
      const student = roster[name];

      if (student && student.pin === pass) {
        // Record login access log
        const logs = JSON.parse(localStorage.getItem("tuition_access_logs_v3") || "[]");
        logs.unshift({
          name: student.name,
          time: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        });
        if (logs.length > 25) logs.pop();
        localStorage.setItem("tuition_access_logs_v3", JSON.stringify(logs));

        localStorage.setItem("tuition_session_v3", JSON.stringify({
          id: name,
          name: student.name,
          feesPaid: student.feesPaid,
          pendingMonths: student.pendingMonths
        }));

        if (name === "admin") {
          window.location.href = "admin.html";
        } else {
          checkAuthAndRender();
        }
      } else {
        err.textContent = "Invalid name or PIN. Please ask Swati Ma'am.";
        err.style.display = "block";
      }
    });
  }

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("tuition_session_v3");
      checkAuthAndRender();
    });
  }
});
