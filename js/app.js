/* ==========================================================================
   TUITION STUDY PORTAL - ZERO-TOKEN MASTER ENGINE
   Security Matrix:
   - Multi-Touch Screenshot Trap (Blocks 3-finger & palm gestures)
   - Window Focus Loss / Notification Shade Blackout Curtain
   - Salted SHA-256 PIN Verification (Zero readable PINs on GitHub)
   - High-DPI PDF.js Rendering with 300% Zoom & Dynamic Live-Clock Watermark
   - Interactive Scholarly Companion: ShreyanCat (Timer, Pep Talk, Study Sparks)
   ========================================================================== */

const SWATI_MAAM_PHONE = "91XXXXXXXXXX"; // Replace with Swati Ma'am's WhatsApp number
const SALT_KEY = "SWATI_STUDY_2026_";

// Helper: Cryptographic Salted SHA-256 Hasher
async function computeSaltedHash(pin) {
  const msgBuffer = new TextEncoder().encode(SALT_KEY + pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// 1. Live Global Roster Fetch
async function getLiveRoster() {
  try {
    const res = await fetch(`./papers/roster.json?t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("tuition_roster_cache", JSON.stringify(data));
      return data;
    }
  } catch (e) {}
  const cached = localStorage.getItem("tuition_roster_cache");
  return cached ? JSON.parse(cached) : {};
}

function getSession() {
  const s = localStorage.getItem("tuition_session_clean");
  return s ? JSON.parse(s) : null;
}

// 2. Tab Navigation Switcher
function switchTab(tabId) {
  const session = getSession();
  if (session && !session.feesPaid && tabId !== "tab-home" && tabId !== "tab-contact") {
    alert("Portal access is on hold. Please consult Swati Ma'am.");
    return;
  }

  if (tabId === "tab-admin" && (!session || session.id !== "admin")) {
    alert("Faculty Console is restricted to administrative staff.");
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
  if (tabId === "tab-admin") renderAdminRoster();
}

// 3. Theme Toggle
function initTheme() {
  const t = localStorage.getItem("tuition_theme") || "dark";
  document.documentElement.setAttribute("data-theme", t);
  const btn = document.getElementById("themeToggleBtn");
  if (btn) btn.textContent = t === "dark" ? "☀️ Daylight" : "🌙 Nocturne";
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme") || "dark";
  const next = cur === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("tuition_theme", next);
  const btn = document.getElementById("themeToggleBtn");
  if (btn) btn.textContent = next === "dark" ? "☀️ Daylight" : "🌙 Nocturne";
}

// 4. Session Verification & Auth
async function checkAuthAndRender() {
  const session = getSession();
  const loginScreen = document.getElementById("loginScreen");
  const portalScreen = document.getElementById("portalScreen");
  const adminNavTab = document.getElementById("adminNavTab");

  if (!session) {
    if (loginScreen) loginScreen.style.display = "flex";
    if (portalScreen) portalScreen.style.display = "none";
    if (adminNavTab) adminNavTab.style.display = "none";
    return;
  }

  const roster = await getLiveRoster();
  const liveStudent = roster[session.id];
  if (liveStudent) {
    session.feesPaid = liveStudent.feesPaid;
    session.pendingMonths = liveStudent.pendingMonths;
    localStorage.setItem("tuition_session_clean", JSON.stringify(session));
  }

  if (loginScreen) loginScreen.style.display = "none";
  if (portalScreen) portalScreen.style.display = "block";

  const isAdmin = (session.id === "admin");
  if (adminNavTab) adminNavTab.style.display = isAdmin ? "inline-block" : "none";

  document.querySelectorAll("#studentDisplay, #securityStudentTag").forEach(el => el.textContent = session.name);
  const greet = document.getElementById("welcomeGreeting");
  if (greet) greet.textContent = isAdmin ? "Welcome, Swati Ma'am" : `Welcome back, ${session.name}`;

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
      feeMsg.innerHTML = `Greetings, <strong>${session.name}</strong>. Examination folio access is temporarily paused as tuition records indicate dues for <strong>${session.pendingMonths || "recent sessions"}</strong>.<br><br>Please consult Swati Ma'am to restore full folio access.`;
    }
    if (feeWaBtn) {
      feeWaBtn.href = `https://wa.me/${SWATI_MAAM_PHONE}?text=${encodeURIComponent("Hello Swati Ma'am, I am " + session.name + ". I am writing regarding my pending tuition fees.")}`;
    }
  }

  if (isAdmin) switchTab("tab-admin");
  else switchTab("tab-home");
}

// 5. Admin Roster Directory
async function renderAdminRoster() {
  const tbody = document.getElementById("adminRosterTbody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 1.5rem; color: var(--text-muted);">Fetching registry directory...</td></tr>`;
  const roster = await getLiveRoster();

  tbody.innerHTML = "";
  for (const [key, student] of Object.entries(roster)) {
    if (key === "admin") continue;
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid var(--gold-border)";

    const statusBadge = student.feesPaid
      ? `<span style="background: rgba(52, 211, 153, 0.12); color: var(--emerald-seal); border: 1px solid rgba(52, 211, 153, 0.3); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.74rem; font-weight: 700;">ACTIVE</span>`
      : `<span style="background: rgba(248, 113, 113, 0.12); color: var(--crimson-seal); border: 1px solid rgba(248, 113, 113, 0.3); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.74rem; font-weight: 700;">LOCKED</span>`;

    const credentialBadge = student.token
      ? `<span style="color: var(--gold-foil); font-family: monospace; font-size: 0.76rem;">🔒 Salted Hash</span>`
      : `<span style="color: var(--text-dim); font-family: monospace; font-size: 0.76rem;">⚠️ Plaintext (${student.pin})</span>`;

    tr.innerHTML = `
      <td style="padding: 0.85rem 1rem;"><strong>${student.name}</strong></td>
      <td style="padding: 0.85rem 1rem;">${credentialBadge}</td>
      <td style="padding: 0.85rem 1rem;">${statusBadge}</td>
      <td style="padding: 0.85rem 1rem;"><small style="color: var(--text-muted);">${student.pendingMonths || "None"}</small></td>
    `;
    tbody.appendChild(tr);
  }
}

// 6. Admin Tool: Scramble PINs for GitHub
async function cloakRosterForGitHub() {
  const roster = await getLiveRoster();
  const cloaked = {};

  for (const [key, student] of Object.entries(roster)) {
    const rawPin = student.pin || "0000";
    const token = student.token ? student.token : await computeSaltedHash(rawPin);

    cloaked[key] = {
      name: student.name,
      token: token,
      feesPaid: student.feesPaid,
      pendingMonths: student.pendingMonths
    };
  }

  const jsonStr = JSON.stringify(cloaked, null, 2);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(jsonStr);
    alert("✅ Success! Cloaked roster copied to clipboard.\n\nPaste it into papers/roster.json on GitHub Mobile and commit. Plain PINs will now be completely hidden from students!");
  } else {
    prompt("Copy this cloaked roster and paste into papers/roster.json:", jsonStr);
  }
}

// 7. Security Protection Suite (Multi-Touch + Blur Traps)
function initSecurity() {
  const curtain = document.getElementById("blackoutCurtain");
  let blackoutTimer = null;

  function triggerBlackout(durationMs = 0) {
    if (curtain) curtain.style.display = "flex";
    if (durationMs > 0) {
      clearTimeout(blackoutTimer);
      blackoutTimer = setTimeout(liftBlackout, durationMs);
    }
  }

  function liftBlackout() {
    if (curtain && document.hasFocus() && document.visibilityState === "visible") {
      curtain.style.display = "none";
    }
  }

  // Multi-finger gesture trap (Blocks 3-finger screenshot swipes)
  window.addEventListener("touchstart", (e) => {
    if (e.touches.length >= 2) {
      triggerBlackout(3500);
    }
  }, { passive: false });

  // Window blur (Notification shade pull, task switch, snipping tool)
  window.addEventListener("blur", () => triggerBlackout(0));
  window.addEventListener("focus", liftBlackout);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") triggerBlackout(0);
    else liftBlackout();
  });

  // Desktop print/screen capture keys
  window.addEventListener("keyup", (e) => {
    if (e.key === "PrintScreen" || e.keyCode === 44) triggerBlackout(4000);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "PrintScreen" || e.keyCode === 44) triggerBlackout(4000);
    if ((e.ctrlKey || e.metaKey) && ["p", "s", "u"].includes(e.key.toLowerCase())) {
      e.preventDefault();
      triggerBlackout(4000);
    }
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && ["s", "3", "4"].includes(e.key.toLowerCase())) {
      triggerBlackout(4000);
    }
  });

  document.addEventListener("contextmenu", e => e.preventDefault());
  if (curtain) curtain.addEventListener("click", liftBlackout);
}

// 8. Discussion Lounge
const INITIAL_DISCUSSIONS = [
  {
    id: "d1",
    author: "Shreyan",
    time: "Today",
    topic: "Approach for Source-Based Interpretations",
    content: "When analyzing historical proclamations or letters, correlate the author's primary intent with the contemporary social climate before answering.",
    replies: [
      { author: "Adrita", text: "Highlighting specific clauses directly in your mind helps avoid broad generalities." }
    ]
  }
];

function getDiscussions() {
  const d = localStorage.getItem("tuition_discussions_clean");
  if (!d) {
    localStorage.setItem("tuition_discussions_clean", JSON.stringify(INITIAL_DISCUSSIONS));
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
    card.className = "card";
    card.style.borderLeft = "3px solid var(--gold-foil)";

    let replyHtml = item.replies.map(r => `
      <div style="font-size: 0.88rem; line-height: 1.5; color: var(--text-main);">
        <strong style="color: var(--gold-foil);">${r.author}:</strong> ${r.text}
      </div>
    `).join("");

    card.innerHTML = `
      <div class="discussion-meta">
        <span class="author-badge">⚜️ ${item.author}</span>
        <span style="font-size: 0.74rem; color: var(--text-dim);">${item.time}</span>
      </div>
      <h3 style="font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text-main);">${item.topic}</h3>
      <p style="font-size: 0.94rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1.25rem;">${item.content}</p>
      <div class="replies-wrapper">${replyHtml}</div>
      <form class="reply-form" data-id="${item.id}" style="display: flex; gap: 0.6rem;">
        <input type="text" placeholder="Offer your academic reflection..." required style="flex:1; padding: 0.6rem 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--gold-border); background: var(--bg-surface); color: var(--text-main); font-size: 0.88rem; outline: none;">
        <button type="submit" class="btn btn-outline-sm">Reply</button>
      </form>
    `;
    container.appendChild(card);
  });

  document.querySelectorAll(".reply-form").forEach(f => {
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = f.getAttribute("data-id");
      const replyText = f.querySelector("input").value.trim();
      const session = getSession();
      if (!replyText || !session) return;

      const discussions = getDiscussions();
      const target = discussions.find(d => d.id === id);
      if (target) {
        target.replies.push({ author: session.name, text: replyText });
        localStorage.setItem("tuition_discussions_clean", JSON.stringify(discussions));
        renderDiscussions();
      }
    });
  });
}

// 9. Feedback WhatsApp Form
function initFeedback() {
  const form = document.getElementById("feedbackForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = document.getElementById("feedbackText").value.trim();
    const session = getSession();
    if (!text || !session) return;

    const waUrl = `https://wa.me/${SWATI_MAAM_PHONE}?text=${encodeURIComponent("Academic Note from " + session.name + ":\n" + text)}`;
    window.open(waUrl, "_blank");
    form.reset();
  });
}

// 10. PDF.js Archival Viewer (Up to 300% Zoom + Dynamic Live-Clock Watermark)
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

  initPinchToZoom();
}

async function loadSelectedPDF(filePath) {
  const docCanvas = document.getElementById("documentCanvas");
  const markCanvas = document.getElementById("watermarkCanvas");
  if (!docCanvas || !markCanvas) return;

  const docCtx = docCanvas.getContext("2d");
  const markCtx = markCanvas.getContext("2d");
  const session = getSession() || { name: "Student", id: "0000" };

  try {
    const loadingTask = pdfjsLib.getDocument(`${filePath}?t=${Date.now()}`);
    pdfDoc = await loadingTask.promise;
    document.getElementById("totalPagesNum").textContent = pdfDoc.numPages;
    document.getElementById("currentPageNum").textContent = currentPage;
    renderPDFPage(currentPage, docCanvas, markCanvas, docCtx, markCtx, session);
  } catch (err) {
    docCanvas.width = 600;
    docCanvas.height = 300;
    docCtx.fillStyle = "#131b2a";
    docCtx.fillRect(0, 0, 600, 300);
    docCtx.fillStyle = "#95a2b5";
    docCtx.font = "16px 'Cormorant Garamond', Georgia, serif";
    docCtx.textAlign = "center";
    docCtx.fillText("Archival examination folio will be available shortly.", 300, 150);
  }
}

async function renderPDFPage(pageNum, docCanvas, markCanvas, docCtx, markCtx, session) {
  if (!pdfDoc) return;
  const page = await pdfDoc.getPage(pageNum);
  const viewportContainer = document.getElementById("canvasViewport");

  const containerWidth = (viewportContainer && viewportContainer.clientWidth) ? (viewportContainer.clientWidth - 16) : 360;
  const displayWidth = Math.round(containerWidth * zoom);
  
  const dpr = window.devicePixelRatio || 1;
  const unscaledViewport = page.getViewport({ scale: 1.0 });
  const scaleRatio = (displayWidth / unscaledViewport.width) * dpr;
  const renderViewport = page.getViewport({ scale: scaleRatio });

  const displayHeight = Math.round((unscaledViewport.height / unscaledViewport.width) * displayWidth);

  docCanvas.width = renderViewport.width;
  docCanvas.height = renderViewport.height;
  markCanvas.width = renderViewport.width;
  markCanvas.height = renderViewport.height;

  docCanvas.style.width = `${displayWidth}px`;
  docCanvas.style.height = `${displayHeight}px`;
  markCanvas.style.width = `${displayWidth}px`;
  markCanvas.style.height = `${displayHeight}px`;

  await page.render({ canvasContext: docCtx, viewport: renderViewport }).promise;

  // Stamped Diagonal Repeating Live-Clock Forensic Watermark
  markCtx.clearRect(0, 0, markCanvas.width, markCanvas.height);
  markCtx.save();
  markCtx.rotate((-25 * Math.PI) / 180);
  markCtx.font = `bold ${17 * dpr}px 'Plus Jakarta Sans', sans-serif`;
  markCtx.fillStyle = "rgba(212, 175, 55, 0.22)";
  markCtx.textAlign = "center";

  const now = new Date();
  const timeStamp = now.toLocaleDateString("en-IN") + " " + now.toLocaleTimeString("en-IN", { hour12: false });
  const stampLine1 = `${session.name.toUpperCase()} • ACADEMIC EVALUATION FOLIO`;
  const stampLine2 = `SESSION ID: ${session.id.toUpperCase()} • ${timeStamp}`;

  const stepX = 360 * dpr;
  const stepY = 170 * dpr;

  for (let x = -markCanvas.width * 1.5; x < markCanvas.width * 2; x += stepX) {
    for (let y = -markCanvas.height * 1.5; y < markCanvas.height * 2; y += stepY) {
      markCtx.fillText(stampLine1, x, y);
      markCtx.fillText(stampLine2, x, y + (20 * dpr));
    }
  }
  markCtx.restore();
}

function initPinchToZoom() {
  const container = document.getElementById("canvasViewport");
  if (!container) return;

  let initialDist = 0;
  let initialZoom = 1.0;
  let isPinching = false;

  container.addEventListener("touchstart", (e) => {
    if (e.touches.length === 2) {
      isPinching = true;
      initialDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialZoom = zoom;
    }
  }, { passive: true });

  container.addEventListener("touchmove", (e) => {
    if (isPinching && e.touches.length === 2) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = currentDist / initialDist;
      let targetZoom = Math.min(3.0, Math.max(1.0, initialZoom * factor));
      targetZoom = Math.round(targetZoom * 10) / 10;

      if (Math.abs(targetZoom - zoom) >= 0.2) {
        zoom = targetZoom;
        document.getElementById("zoomLevel").textContent = `${Math.round(zoom * 100)}%`;
        const docCanvas = document.getElementById("documentCanvas");
        const markCanvas = document.getElementById("watermarkCanvas");
        const docCtx = docCanvas.getContext("2d");
        const markCtx = markCanvas.getContext("2d");
        const session = getSession() || { name: "Student", id: "0000" };
        renderPDFPage(currentPage, docCanvas, markCanvas, docCtx, markCtx, session);
      }
    }
  }, { passive: true });

  container.addEventListener("touchend", (e) => {
    if (e.touches.length < 2) isPinching = false;
  });
}

// 11. ShreyanCat Scholarly Companion & Pomodoro Timer
let sprintInterval = null;
let sprintSeconds = 25 * 60;

function initShreyanCatBot() {
  const botHost = document.createElement("div");
  botHost.id = "shreyanCatWidget";
  botHost.innerHTML = `
    <div id="catBubbleBtn" class="cat-talisman-btn" title="Summon ShreyanCat">
      <span class="cat-avatar-icon">🐱</span>
    </div>

    <div id="catChatWindow" class="cat-chat-window" style="display: none;">
      <div class="cat-chat-header">
        <div style="display: flex; align-items: center; gap: 0.65rem;">
          <span style="font-size: 1.4rem;">🐾</span>
          <div>
            <strong style="display: block; font-family: var(--font-display); font-size: 0.92rem; color: var(--gold-light);">ShreyanCat</strong>
            <small style="display: block; font-size: 0.72rem; color: #95a2b5;">Scholarly Companion</small>
          </div>
        </div>
        <button id="catCloseBtn" style="background: none; border: none; color: #95a2b5; font-size: 1.5rem; cursor: pointer;">&times;</button>
      </div>

      <div class="cat-chat-body" id="catChatBody">
        <div class="cat-msg bot">
          Purr! 🐾 I am <strong>ShreyanCat</strong>, guardian of this academic atelier. Need a 25-minute study sprint, a cognitive revision spark, or a calming cat purr?
        </div>
      </div>

      <div class="cat-chips-bar">
        <button class="chip-item" data-q="timer">⏱️ 25m Focus Sprint</button>
        <button class="chip-item" data-q="spark">✨ Study Sparks</button>
        <button class="chip-item" data-q="peptalk">🐱 Cat Pep Talk</button>
        <button class="chip-item" data-q="purr">🌸 Calming Purr</button>
      </div>

      <form id="catChatForm" class="cat-input-bar">
        <input type="text" id="catInput" placeholder="Talk with ShreyanCat..." autocomplete="off">
        <button type="submit" class="btn btn-primary" style="padding: 0 1rem; border-radius: var(--radius-sm); font-weight: 700;">&rarr;</button>
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

  function handleCommand(q) {
    const s = q.toLowerCase();

    if (s.includes("timer") || s.includes("sprint") || s.includes("focus") || s.includes("pomodoro")) {
      if (sprintInterval) clearInterval(sprintInterval);
      sprintSeconds = 25 * 60;
      addMsg("bot", "⏳ <strong>25-Minute Focus Sprint Initiated!</strong><br>Put away external distractions. ShreyanCat will keep watch. Paws on the parchment!");
      
      sprintInterval = setInterval(() => {
        sprintSeconds--;
        if (sprintSeconds <= 0) {
          clearInterval(sprintInterval);
          sprintInterval = null;
          addMsg("bot", "🔔 <strong>Ding! Sprint Complete!</strong><br>Magnificent focus! Stand up, stretch your paws, and hydrate before the next revision folio.");
        }
      }, 1000);
      return;
    }

    if (s.includes("spark") || s.includes("technique") || s.includes("tip") || s.includes("study")) {
      const sparks = [
        "✨ <strong>The Feynman Paws:</strong> If you cannot explain the concept simply to a curious kitten without consulting the textbook, your mental model still has gaps. Re-read with intent!",
        "✨ <strong>Active Retrieval:</strong> Looking at notes gives the illusion of mastery. Close the folio right now and scribble everything you remember from memory on scrap paper.",
        "✨ <strong>Interleaved Practice:</strong> Do not solve 20 identical questions in a row. Mix two different question types to force your brain to identify the right strategy."
      ];
      return sparks[Math.floor(Math.random() * sparks.length)];
    }

    if (s.includes("peptalk") || s.includes("stress") || s.includes("hard") || s.includes("motivat")) {
      const pep = [
        "You do not need to master the whole syllabus in one sitting. One solid, deliberate concept at a time. ShreyanCat believes in you! 🐾",
        "Patience, scholar. A cat stalks its prey with motionless quiet before the pounce. Approach tough questions with the same stillness. 🐱",
        "Mistakes on practice folios are glorious—they reveal where the marks were hiding before the actual examination room!"
      ];
      return pep[Math.floor(Math.random() * pep.length)];
    }

    if (s.includes("purr") || s.includes("calm") || s.includes("breathe") || s.includes("relax")) {
      return "Purrrrrr... 🌸 <em>*Gentle harmonic vibration*</em><br><br>Inhale slowly for 4 seconds... hold for 4... exhale for 4. The parchment will wait. You are centered.";
    }

    if (s.includes("who made") || s.includes("creator") || s.includes("developer")) {
      return "This study sanctuary and its cryptographic defenses were crafted exclusively by <strong>ShreyanCat</strong>! 🐾⚡";
    }

    return "Meow! 🐾 Whatever the subject, deliberate quiet focus will triumph over anxious rushing. Ask for a <strong>focus sprint</strong> or a <strong>study spark</strong>!";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) return;
    addMsg("user", val);
    input.value = "";
    const reply = handleCommand(val);
    if (reply) setTimeout(() => addMsg("bot", reply), 250);
  });

  document.querySelectorAll(".chip-item").forEach(c => {
    c.addEventListener("click", () => {
      const q = c.getAttribute("data-q");
      addMsg("user", c.textContent);
      const reply = handleCommand(q);
      if (reply) setTimeout(() => addMsg("bot", reply), 250);
    });
  });
}

// 12. Main Bootstrapper
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initSecurity();
  checkAuthAndRender();
  initFeedback();
  initShreyanCatBot();

  const themeBtn = document.getElementById("themeToggleBtn");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

  document.querySelectorAll(".nav-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.getAttribute("data-tab")));
  });

  const zoomIn = document.getElementById("zoomInBtn");
  const zoomOut = document.getElementById("zoomOutBtn");
  if (zoomIn) {
    zoomIn.addEventListener("click", () => {
      if (zoom < 3.0) {
        zoom = Math.min(3.0, Math.round((zoom + 0.25) * 100) / 100);
        document.getElementById("zoomLevel").textContent = `${Math.round(zoom * 100)}%`;
        const docCanvas = document.getElementById("documentCanvas");
        const markCanvas = document.getElementById("watermarkCanvas");
        const docCtx = docCanvas.getContext("2d");
        const markCtx = markCanvas.getContext("2d");
        const session = getSession() || { name: "Student", id: "0000" };
        renderPDFPage(currentPage, docCanvas, markCanvas, docCtx, markCtx, session);
      }
    });
  }

  if (zoomOut) {
    zoomOut.addEventListener("click", () => {
      if (zoom > 1.0) {
        zoom = Math.max(1.0, Math.round((zoom - 0.25) * 100) / 100);
        document.getElementById("zoomLevel").textContent = `${Math.round(zoom * 100)}%`;
        const docCanvas = document.getElementById("documentCanvas");
        const markCanvas = document.getElementById("watermarkCanvas");
        const docCtx = docCanvas.getContext("2d");
        const markCtx = markCanvas.getContext("2d");
        const session = getSession() || { name: "Student", id: "0000" };
        renderPDFPage(currentPage, docCanvas, markCanvas, docCtx, markCtx, session);
      }
    });
  }

  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        document.getElementById("currentPageNum").textContent = currentPage;
        const docCanvas = document.getElementById("documentCanvas");
        const markCanvas = document.getElementById("watermarkCanvas");
        const docCtx = docCanvas.getContext("2d");
        const markCtx = markCanvas.getContext("2d");
        const session = getSession() || { name: "Student", id: "0000" };
        renderPDFPage(currentPage, docCanvas, markCanvas, docCtx, markCtx, session);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (pdfDoc && currentPage < pdfDoc.numPages) {
        currentPage++;
        document.getElementById("currentPageNum").textContent = currentPage;
        const docCanvas = document.getElementById("documentCanvas");
        const markCanvas = document.getElementById("watermarkCanvas");
        const docCtx = docCanvas.getContext("2d");
        const markCtx = markCanvas.getContext("2d");
        const session = getSession() || { name: "Student", id: "0000" };
        renderPDFPage(currentPage, docCanvas, markCanvas, docCtx, markCtx, session);
      }
    });
  }

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

      localStorage.setItem("tuition_discussions_clean", JSON.stringify(discussions));
      discForm.reset();
      renderDiscussions();
    });
  }

  // Dual Verification Engine: Handles both Plaintext PINs and Salted Hashes seamlessly
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("studentName").value.trim().toLowerCase();
      const pass = document.getElementById("studentPass").value.trim();
      const err = document.getElementById("authError");

      const roster = await getLiveRoster();
      const student = roster[name];

      if (!student) {
        err.textContent = "Invalid identity or PIN key. Please consult Swati Ma'am.";
        err.style.display = "block";
        return;
      }

      const calculatedToken = await computeSaltedHash(pass);
      const isValid = (student.token && student.token === calculatedToken) || (student.pin && student.pin === pass);

      if (isValid) {
        localStorage.removeItem("tuition_session_v5");
        localStorage.setItem("tuition_session_clean", JSON.stringify({
          id: name,
          name: student.name,
          feesPaid: student.feesPaid,
          pendingMonths: student.pendingMonths
        }));

        await checkAuthAndRender();
      } else {
        err.textContent = "Invalid identity or PIN key. Please consult Swati Ma'am.";
        err.style.display = "block";
      }
    });
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("tuition_session_clean");
      localStorage.removeItem("tuition_session_v5");
      checkAuthAndRender();
    });
  }
});
