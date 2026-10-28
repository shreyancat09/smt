/* ==========================================================================
   TUITION STUDY PORTAL - MASTER ENGINE
   Features:
   - Global GitHub Fee Sync from papers/roster.json
   - High-DPI Retina Canvas Sharpening (devicePixelRatio)
   - Anti-Pull-To-Refresh Breakout Arcade
   - WhatsApp-Direct Student Doubts
   - ShreyanCat Assistant & Desktop Paw Trail
   ========================================================================== */

// Configure Instructor WhatsApp Phone Number (with Country Code, no '+' or spaces)
const SWATI_MAAM_PHONE = "918910337293";

// Fallback student roster
const DEFAULT_FALLBACK_ROSTER = {
  "shreyan": { name: "Shreyan", pin: "5542", feesPaid: true, pendingMonths: "" },
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

// 1. Live Global Roster Fetch (Pulls fresh status from GitHub repository)
async function getLiveRoster() {
  try {
    const res = await fetch(`./papers/roster.json?t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("tuition_roster_cache", JSON.stringify(data));
      return data;
    }
  } catch (e) {
    // offline or network fallback
  }
  const cached = localStorage.getItem("tuition_roster_cache");
  return cached ? JSON.parse(cached) : DEFAULT_FALLBACK_ROSTER;
}

function getSession() {
  const s = localStorage.getItem("tuition_session_v5");
  return s ? JSON.parse(s) : null;
}

// 2. Tab Navigation Switcher (Instant & Zero 404s)
function switchTab(tabId) {
  const session = getSession();
  if (session && !session.feesPaid && tabId !== "tab-home" && tabId !== "tab-contact") {
    alert("Portal access is paused. Please clear dues with Swati Ma'am.");
    return;
  }

  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".nav-tab-btn").forEach(el => el.classList.remove("active"));

  const targetTab = document.getElementById(tabId);
  const targetBtn = document.querySelector(`[data-tab="${tabId}"]`);
  if (targetTab) targetTab.classList.add("active");
  if (targetBtn) targetBtn.classList.add("active");

  if (tabId === "tab-paper") initPDFViewer();
  if (tabId === "tab-discussion") renderDiscussions();
}

// 3. Theme Management
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

// 4. Session Validation & Fee Lock Renderer (Validates with live roster)
async function checkAuthAndRender() {
  const session = getSession();
  const loginScreen = document.getElementById("loginScreen");
  const portalScreen = document.getElementById("portalScreen");

  if (!session) {
    loginScreen.style.display = "flex";
    portalScreen.style.display = "none";
    return;
  }

  // Cross-check live fee status from GitHub
  const roster = await getLiveRoster();
  const liveStudent = roster[session.id];
  if (liveStudent) {
    session.feesPaid = liveStudent.feesPaid;
    session.pendingMonths = liveStudent.pendingMonths;
    localStorage.setItem("tuition_session_v5", JSON.stringify(session));
  }

  loginScreen.style.display = "none";
  portalScreen.style.display = "block";

  document.querySelectorAll("#studentDisplay, #securityStudentTag").forEach(el => el.textContent = session.name);
  const greet = document.getElementById("welcomeGreeting");
  if (greet) greet.textContent = `Welcome back, ${session.name}!`;

  const homeUnlocked = document.getElementById("homeUnlockedView");
  const feeCard = document.getElementById("feeLockScreen");
  const feeMsg = document.getElementById("feeLockMessage");
  const feeWaBtn = document.getElementById("feeWhatsAppBtn");

  if (session.feesPaid) {
    if (homeUnlocked) homeUnlocked.style.display = "block";
    if (feeCard) feeCard.style.display = "none";
  } else {
    if (homeUnlocked) homeUnlocked.style.display = "none";
    if (feeCard) feeCard.style.display = "block";
    if (feeMsg) {
      feeMsg.innerHTML = `Hello <strong>${session.name}</strong>, your evaluation portal is temporarily on hold because tuition fees for <strong>${session.pendingMonths || "recent months"}</strong> are pending.<br><br>Please clear dues with Swati Ma'am to unlock.`;
    }
    if (feeWaBtn) {
      feeWaBtn.href = `https://wa.me/${SWATI_MAAM_PHONE}?text=${encodeURIComponent("Hello Swati Ma'am, I am " + session.name + ". I am writing regarding my pending tuition fees.")}`;
    }
  }
}

// 5. Desktop-Only Cat Paw Trail Effect
function initPawTrail() {
  if (window.matchMedia("(pointer: fine)").matches && window.innerWidth > 768) {
    let lastTime = 0;
    document.addEventListener("mousemove", (e) => {
      const now = Date.now();
      if (now - lastTime < 70) return;
      lastTime = now;

      const paw = document.createElement("span");
      paw.className = "floating-paw";
      paw.textContent = "🐾";
      
      const rot = (Math.random() * 40 - 20);
      paw.style.left = `${e.clientX}px`;
      paw.style.top = `${e.clientY}px`;
      paw.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(${0.7 + Math.random() * 0.4})`;

      document.body.appendChild(paw);
      setTimeout(() => paw.remove(), 850);
    });
  }
}

// 6. Discussion Lounge
const INITIAL_DISCUSSIONS = [
  {
    id: "d1",
    author: "Shreyan",
    time: "Today at 4:15 PM",
    topic: "Tips for Class 10 History Timeline Questions",
    content: "Remember that the Rowlatt Act is 1919 and Non-Cooperation was launched in 1920. Don't mix up the dates in Section A!",
    replies: [
      { author: "Adrita", text: "Thanks! Also Chauri Chaura incident occurred in Feb 1922 which ended it." }
    ]
  },
  {
    id: "d2",
    author: "Progyan",
    time: "Yesterday at 6:30 PM",
    topic: "Map Practice for Sunday Assessment",
    content: "Are we being tested on major iron ore belts or dams this weekend?",
    replies: [
      { author: "Ayushman", text: "Ma'am mentioned dams and major soil types will be on the 5-mark map section." }
    ]
  }
];

function getDiscussions() {
  const d = localStorage.getItem("tuition_discussions_v5");
  if (!d) {
    localStorage.setItem("tuition_discussions_v5", JSON.stringify(INITIAL_DISCUSSIONS));
    return INITIAL_DISCUSSIONS;
  }
  return JSON.parse(d);
}

function renderDiscussions() {
  const container = document.getElementById("discussionFeed");
  if (!container) return;
  const list = getDiscussions();

  container.innerHTML = "";
  list.forEach(item => {
    const card = document.createElement("article");
    card.className = "card discussion-item-card";

    let replyHtml = item.replies.map(r => `
      <div class="discussion-reply">
        <strong>${r.author}:</strong> ${r.text}
      </div>
    `).join("");

    card.innerHTML = `
      <div class="discussion-meta">
        <span class="author-badge">🐱 ${item.author}</span>
        <span class="time-badge">${item.time}</span>
      </div>
      <h3 class="discussion-title">${item.topic}</h3>
      <p class="discussion-text">${item.content}</p>
      
      <div class="replies-wrapper">
        ${replyHtml}
      </div>

      <form class="reply-form" data-id="${item.id}">
        <input type="text" placeholder="Write a reply..." required>
        <button type="submit" class="btn btn-outline-sm">Reply</button>
      </form>
    `;

    container.appendChild(card);
  });

  document.querySelectorAll(".reply-form").forEach(f => {
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = f.getAttribute("data-id");
      const input = f.querySelector("input");
      const replyText = input.value.trim();
      const session = getSession();
      if (!replyText || !session) return;

      const discussions = getDiscussions();
      const target = discussions.find(d => d.id === id);
      if (target) {
        target.replies.push({ author: session.name, text: replyText });
        localStorage.setItem("tuition_discussions_v5", JSON.stringify(discussions));
        renderDiscussions();
      }
    });
  });
}

// 7. Student Notes Routing Directly to WhatsApp
function initFeedback() {
  const form = document.getElementById("feedbackForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = document.getElementById("feedbackText").value.trim();
    const session = getSession();
    if (!text || !session) return;

    // Direct WhatsApp message pre-fill
    const waUrl = `https://wa.me/${SWATI_MAAM_PHONE}?text=${encodeURIComponent("Student Doubt from " + session.name + ":\n" + text)}`;
    window.open(waUrl, "_blank");
    form.reset();
  });
}

// 8. PDF.js Viewer with High-DPI Canvas Sharpening & Watermarking
let pdfDoc = null;
let currentPage = 1;
let zoom = 1.0;
let currentPaperPath = "";

async function initPDFViewer() {
  if (typeof pdfjsLib === "undefined") return;
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  const selector = document.getElementById("paperSelect");
  if (!selector) return;

  try {
    const res = await fetch(`./papers/papers.json?t=${Date.now()}`);
    if (res.ok) {
      const papers = await res.json();
      selector.innerHTML = "";
      papers.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p.file;
        opt.textContent = p.title;
        selector.appendChild(opt);
      });
      if (papers.length > 0) {
        currentPaperPath = papers[0].file;
        loadSelectedPDF(currentPaperPath);
      }
    } else {
      loadSelectedPDF("./papers/weekly.pdf");
    }
  } catch (e) {
    loadSelectedPDF("./papers/weekly.pdf");
  }

  selector.onchange = () => {
    currentPaperPath = selector.value;
    currentPage = 1;
    loadSelectedPDF(currentPaperPath);
  };
}

async function loadSelectedPDF(filePath) {
  const docCanvas = document.getElementById("documentCanvas");
  const markCanvas = document.getElementById("watermarkCanvas");
  if (!docCanvas || !markCanvas) return;

  const docCtx = docCanvas.getContext("2d");
  const markCtx = markCanvas.getContext("2d");
  const session = getSession() || { name: "Student" };

  try {
    const loadingTask = pdfjsLib.getDocument(`${filePath}?t=${Date.now()}`);
    pdfDoc = await loadingTask.promise;
    document.getElementById("totalPagesNum").textContent = pdfDoc.numPages;
    document.getElementById("currentPageNum").textContent = currentPage;
    renderPDFPage(currentPage, docCanvas, markCanvas, docCtx, markCtx, session);
  } catch (err) {
    docCanvas.width = 600;
    docCanvas.height = 300;
    docCtx.fillStyle = "#ffffff";
    docCtx.fillRect(0, 0, 600, 300);
    docCtx.fillStyle = "#64748b";
    docCtx.font = "16px sans-serif";
    docCtx.textAlign = "center";
    docCtx.fillText("Selected test paper will be available shortly.", 300, 150);
  }
}

async function renderPDFPage(pageNum, docCanvas, markCanvas, docCtx, markCtx, session) {
  if (!pdfDoc) return;
  const page = await pdfDoc.getPage(pageNum);

  // High-DPI Retina Display Multiplier
  const dpr = window.devicePixelRatio || 1;
  const baseScale = zoom * 1.35;
  const viewport = page.getViewport({ scale: baseScale * dpr });

  // High resolution hardware buffer
  docCanvas.width = viewport.width;
  docCanvas.height = viewport.height;
  markCanvas.width = viewport.width;
  markCanvas.height = viewport.height;

  // Responsive CSS viewport display sizing
  docCanvas.style.width = "100%";
  docCanvas.style.height = "auto";
  markCanvas.style.width = "100%";
  markCanvas.style.height = "auto";

  await page.render({ canvasContext: docCtx, viewport: viewport }).promise;

  // Clean dynamic watermark (NO PIN, NO CLASS)
  markCtx.clearRect(0, 0, markCanvas.width, markCanvas.height);
  markCtx.save();
  markCtx.rotate((-25 * Math.PI) / 180);
  markCtx.font = `bold ${22 * dpr}px sans-serif`;
  markCtx.fillStyle = "rgba(220, 38, 38, 0.13)";
  markCtx.textAlign = "center";

  const stamp = `${session.name.toUpperCase()} • PRIVATE ASSESSMENT • CONFIDENTIAL`;
  const stepX = 340 * dpr;
  const stepY = 200 * dpr;

  for (let x = -markCanvas.width; x < markCanvas.width * 2; x += stepX) {
    for (let y = -markCanvas.height; y < markCanvas.height * 2; y += stepY) {
      markCtx.fillText(stamp, x, y);
    }
  }
  markCtx.restore();
}

// 9. Breakout Arcade (With Pull-To-Refresh Lock)
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
  }, { passive: true });

  function gameLoop() {
    if (gameState === "PLAYING") {
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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

      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

      balls.forEach((b, idx) => {
        b.x += b.dx;
        b.y += b.dy;

        if (b.x + b.r > canvas.width || b.x - b.r < 0) b.dx = -b.dx;
        if (b.y - b.r < 0) b.dy = -b.dy;

        if (b.y + b.r >= paddle.y && b.x >= paddle.x && b.x <= paddle.x + paddle.w && b.dy > 0) {
          b.dy = -b.dy;
        }

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
          overlaySub.textContent = `Score: ${score} pts. Head clear? Ready for another round?`;
          overlayBtn.textContent = "Play Again";
          overlay.style.display = "flex";
        } else {
          spawnBall();
        }
      }

      if (active === 0) {
        gameState = "WON";
        overlayTitle.textContent = "BOARD CLEARED! 🏆";
        overlaySub.textContent = `Reflex master! Final Score: ${score} pts.`;
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
      overlaySub.textContent = "Game paused. Tap resume when ready.";
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

// 10. ShreyanCat Interactive Assistant Widget
function initShreyanCatBot() {
  const botHost = document.createElement("div");
  botHost.id = "shreyanCatWidget";
  botHost.innerHTML = `
    <div id="catBubbleBtn" class="cat-floating-bubble" title="Talk to ShreyanCat!">
      <span class="cat-face-icon">🐱</span>
      <span class="cat-active-beacon"></span>
    </div>

    <div id="catChatWindow" class="cat-chat-window" style="display: none;">
      <div class="cat-chat-header">
        <div class="cat-brand-wrap">
          <span>🐾</span>
          <div>
            <strong>ShreyanCat</strong>
            <small>Classroom AI Companion</small>
          </div>
        </div>
        <button id="catCloseBtn" class="cat-close-btn">&times;</button>
      </div>

      <div class="cat-chat-body" id="catChatBody">
        <div class="cat-msg bot">
          Purr! 🐾 I am <strong>ShreyanCat</strong>! How can I help with your study routine or tuition batches today?
        </div>
      </div>

      <div class="cat-chips-bar">
        <button class="chip-item" data-q="batch">Class Timings</button>
        <button class="chip-item" data-q="paper">Weekly Test</button>
        <button class="chip-item" data-q="joke">Cat Joke</button>
        <button class="chip-item" data-q="fees">Fees Info</button>
      </div>

      <form id="catChatForm" class="cat-input-bar">
        <input type="text" id="catInput" placeholder="Ask ShreyanCat a question..." autocomplete="off">
        <button type="submit" class="cat-send-btn">&rarr;</button>
      </form>
    </div>
  `;
  document.body.appendChild(botHost);

  const bubble = document.getElementById("catBubbleBtn");
  const win = document.getElementById("catChatWindow");
  const close = document.getElementById("catCloseBtn");
  const form = document.getElementById("catChatForm");
  const input = document.getElementById("catInput");
  const chatBody = document.getElementById("catChatBody");

  bubble.addEventListener("click", () => {
    win.style.display = win.style.display === "none" ? "flex" : "none";
  });
  close.addEventListener("click", () => { win.style.display = "none"; });

  function addMsg(sender, text) {
    const m = document.createElement("div");
    m.className = `cat-msg ${sender}`;
    m.innerHTML = text;
    chatBody.appendChild(m);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function getReply(q) {
    const s = q.toLowerCase();
    if (s.includes("batch") || s.includes("time") || s.includes("timing") || s.includes("schedule")) {
      return "Class batches meet Tuesday & Friday (5:00 PM) or Wednesday & Saturday (5:30 PM). Sunday is test & doubt clearing at 9:00 AM! 🐾";
    }
    if (s.includes("paper") || s.includes("test") || s.includes("exam") || s.includes("omr")) {
      return "Weekly mock papers are uploaded into the <strong>Sample Paper</strong> tab! Check questions on-screen and bring your blank 50-mark OMR sheets on Sunday.";
    }
    if (s.includes("joke") || s.includes("funny") || s.includes("laugh")) {
      return "Why was the cat sitting on the computer? Because it wanted to keep an eye on the mouse! 🐭😹";
    }
    if (s.includes("fee") || s.includes("due") || s.includes("lock") || s.includes("pay")) {
      return "If your assessment tab is locked, have your parents drop a quick WhatsApp message to Swati Ma'am to clear dues! 💬";
    }
    if (s.includes("who made") || s.includes("developer") || s.includes("creator") || s.includes("cat")) {
      return "I was built exclusively for this tuition desk by <strong>ShreyanCat</strong>! 🐾⚡";
    }
    return "Meow! Got it. Check the Notice Board on your dashboard or ask Swati Ma'am during batch hours for more details! 🐾";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) return;
    addMsg("user", val);
    input.value = "";
    setTimeout(() => addMsg("bot", getReply(val)), 350);
  });

  document.querySelectorAll(".chip-item").forEach(c => {
    c.addEventListener("click", () => {
      const q = c.getAttribute("data-q");
      addMsg("user", c.textContent);
      setTimeout(() => addMsg("bot", getReply(q)), 300);
    });
  });
}

// 11. Security Protection
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

// 12. Main Bootstrapper
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initSecurity();
  initPawTrail();
  checkAuthAndRender();
  initBreakout();
  initFeedback();
  initShreyanCatBot();

  const themeBtn = document.getElementById("themeToggleBtn");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

  document.querySelectorAll(".nav-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.getAttribute("data-tab")));
  });

  const zoomIn = document.getElementById("zoomInBtn");
  const zoomOut = document.getElementById("zoomOutBtn");
  if (zoomIn) zoomIn.addEventListener("click", () => { if (zoom < 1.4) { zoom += 0.1; document.getElementById("zoomLevel").textContent = `${Math.round(zoom * 100)}%`; initPDFViewer(); } });
  if (zoomOut) zoomOut.addEventListener("click", () => { if (zoom > 0.8) { zoom -= 0.1; document.getElementById("zoomLevel").textContent = `${Math.round(zoom * 100)}%`; initPDFViewer(); } });

  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");
  if (prevBtn) prevBtn.addEventListener("click", () => { if (currentPage > 1) { currentPage--; document.getElementById("currentPageNum").textContent = currentPage; initPDFViewer(); } });
  if (nextBtn) nextBtn.addEventListener("click", () => { if (pdfDoc && currentPage < pdfDoc.numPages) { currentPage++; document.getElementById("currentPageNum").textContent = currentPage; initPDFViewer(); } });

  const discForm = document.getElementById("discussionForm");
  if (discForm) {
    discForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const topic = document.getElementById("discussionTopic").value.trim();
      const content = document.getElementById("discussionContent").value.trim();
      const session = getSession();
      if (!topic || !content || !session) return;

      const discussions = getDiscussions();
      discussions.unshift({
        id: "d_" + Date.now(),
        author: session.name,
        time: "Just now",
        topic: topic,
        content: content,
        replies: []
      });

      localStorage.setItem("tuition_discussions_v5", JSON.stringify(discussions));
      discForm.reset();
      renderDiscussions();
    });
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("studentName").value.trim().toLowerCase();
      const pass = document.getElementById("studentPass").value.trim();
      const err = document.getElementById("authError");

      const roster = await getLiveRoster();
      const student = roster[name];

      if (student && student.pin === pass) {
        const logs = JSON.parse(localStorage.getItem("tuition_access_logs_v5") || "[]");
        logs.unshift({
          name: student.name,
          time: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        });
        if (logs.length > 25) logs.pop();
        localStorage.setItem("tuition_access_logs_v5", JSON.stringify(logs));

        localStorage.setItem("tuition_session_v5", JSON.stringify({
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

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("tuition_session_v5");
      checkAuthAndRender();
    });
  }
});
