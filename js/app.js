/* ==========================================================================
   TUITION STUDY PORTAL - ZERO-TOKEN MASTER ENGINE (EDITORIAL REVISION)
   Features:
   - High-DPI Canvas Rendering with Dynamic Width Scaling (No 100% Clamp)
   - Smooth Mobile Pinch-to-Zoom & Horizontal/Vertical Swiping (100% to 300%)
   - Dedicated Faculty Desk for Admin
   - Clean Session Routing (Direct entry to Overview / Faculty Desk)
   - Direct WhatsApp Doubt Routing
   - ShreyanCat Companion Talisman & Atmospheric Cursor Trail
   ========================================================================== */

const SWATI_MAAM_PHONE = "91XXXXXXXXXX";

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
    alert("Portal access is paused. Please clear dues with Swati Ma'am.");
    return;
  }

  if (tabId === "tab-admin" && (!session || session.id !== "admin")) {
    alert("Faculty Desk is restricted to administrative staff.");
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

// 3. Theme Management
function initTheme() {
  const t = localStorage.getItem("tuition_theme") || "light";
  document.documentElement.setAttribute("data-theme", t);
  const btn = document.getElementById("themeToggleBtn");
  if (btn) btn.textContent = t === "dark" ? "☀️ Daylight" : "🌙 Nocturne";
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme") || "light";
  const next = cur === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("tuition_theme", next);
  const btn = document.getElementById("themeToggleBtn");
  if (btn) btn.textContent = next === "dark" ? "☀️ Daylight" : "🌙 Nocturne";
}

// 4. Session Validation & Role-Based UI Rendering
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
  if (adminNavTab) {
    adminNavTab.style.display = isAdmin ? "inline-block" : "none";
  }

  document.querySelectorAll("#studentDisplay, #securityStudentTag").forEach(el => el.textContent = session.name);
  const greet = document.getElementById("welcomeGreeting");
  if (greet) {
    greet.textContent = isAdmin ? "Welcome, Swati Ma'am" : `Welcome back, ${session.name}`;
  }

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
      feeMsg.innerHTML = `Greetings, <strong>${session.name}</strong>. Examination portal access is temporarily paused as tuition dues for <strong>${session.pendingMonths || "recent sessions"}</strong> remain pending.<br><br>Please clear dues with Swati Ma'am to restore full folio access.`;
    }
    if (feeWaBtn) {
      feeWaBtn.href = `https://wa.me/${SWATI_MAAM_PHONE}?text=${encodeURIComponent("Hello Swati Ma'am, I am " + session.name + ". I am writing regarding my pending tuition fees.")}`;
    }
  }

  if (isAdmin) {
    switchTab("tab-admin");
  } else {
    switchTab("tab-home");
  }
}

// 5. Render Admin Roster Directory
async function renderAdminRoster() {
  const tbody = document.getElementById("adminRosterTbody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Fetching registry directory...</td></tr>`;
  const roster = await getLiveRoster();

  tbody.innerHTML = "";
  for (const [key, student] of Object.entries(roster)) {
    if (key === "admin") continue;
    const tr = document.createElement("tr");

    const statusBadge = student.feesPaid
      ? `<span style="background: rgba(27, 102, 62, 0.1); color: var(--emerald-seal); border: 1px solid rgba(27, 102, 62, 0.25); padding: 0.25rem 0.65rem; border-radius: 4px; font-size: 0.74rem; font-weight: 700; letter-spacing: 0.04em;">ACTIVE</span>`
      : `<span style="background: rgba(153, 27, 27, 0.1); color: var(--crimson-seal); border: 1px solid rgba(153, 27, 27, 0.25); padding: 0.25rem 0.65rem; border-radius: 4px; font-size: 0.74rem; font-weight: 700; letter-spacing: 0.04em;">LOCKED</span>`;

    tr.innerHTML = `
      <td><strong>${student.name}</strong></td>
      <td><code style="background: var(--bg-surface-elevated); padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid var(--border-hairline);">${student.pin}</code></td>
      <td>${statusBadge}</td>
      <td><small style="color: var(--text-muted);">${student.pendingMonths || "None"}</small></td>
    `;
    tbody.appendChild(tr);
  }
}

// 6. Atmospheric Desktop Cursor Trail
function initPawTrail() {
  if (window.matchMedia("(pointer: fine)").matches && window.innerWidth > 768) {
    let lastTime = 0;
    document.addEventListener("mousemove", (e) => {
      const now = Date.now();
      if (now - lastTime < 75) return;
      lastTime = now;

      const paw = document.createElement("span");
      paw.className = "floating-paw";
      paw.textContent = "⚜️";
      
      const rot = (Math.random() * 40 - 20);
      paw.style.left = `${e.clientX}px`;
      paw.style.top = `${e.clientY}px`;
      paw.style.transform = `translate(-50%, -50%) rotate(${rot}deg) scale(${0.7 + Math.random() * 0.4})`;

      document.body.appendChild(paw);
      setTimeout(() => paw.remove(), 900);
    });
  }
}

// 7. Discussion Lounge
const INITIAL_DISCUSSIONS = [
  {
    id: "d1",
    author: "Shreyan",
    time: "Today at 4:15 PM",
    topic: "Key Dates for Class 10 History Timeline",
    content: "Keep in mind that the Rowlatt Act is 1919 and Non-Cooperation was formally adopted in 1920. Avoid conflating the timeline in Section A.",
    replies: [
      { author: "Adrita", text: "Important addition: the Chauri Chaura incident occurred in Feb 1922 which triggered its withdrawal." }
    ]
  },
  {
    id: "d2",
    author: "Progyan",
    time: "Yesterday at 6:30 PM",
    topic: "Map Practice for Sunday Assessment",
    content: "Are we being evaluated on major iron ore deposits or river dams this coming Sunday?",
    replies: [
      { author: "Ayushman", text: "Ma'am noted that major dam locations and soil classifications will headline the 5-mark cartography portion." }
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
    card.className = "card discussion-item-card";

    let replyHtml = item.replies.map(r => `
      <div class="discussion-reply">
        <strong>${r.author}:</strong> ${r.text}
      </div>
    `).join("");

    card.innerHTML = `
      <div class="discussion-meta">
        <span class="author-badge">⚜️ ${item.author}</span>
        <span class="time-badge">${item.time}</span>
      </div>
      <h3 class="discussion-title">${item.topic}</h3>
      <p class="discussion-text">${item.content}</p>
      
      <div class="replies-wrapper">
        ${replyHtml}
      </div>

      <form class="reply-form" data-id="${item.id}">
        <input type="text" placeholder="Offer your academic reply..." required>
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
        localStorage.setItem("tuition_discussions_clean", JSON.stringify(discussions));
        renderDiscussions();
      }
    });
  });
}

// 8. WhatsApp Routing
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

// 9. PDF.js Archival Viewer (Up to 300% Zoom + Pinch Support)
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
    docCtx.fillStyle = "#1e2638";
    docCtx.fillRect(0, 0, 600, 300);
    docCtx.fillStyle = "#9ba6b5";
    docCtx.font = "15px 'Playfair Display', Georgia, serif";
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

  // Stamped watermark
  markCtx.clearRect(0, 0, markCanvas.width, markCanvas.height);
  markCtx.save();
  markCtx.rotate((-25 * Math.PI) / 180);
  markCtx.font = `600 ${23 * dpr}px 'Cinzel', serif`;
  markCtx.fillStyle = "rgba(180, 140, 50, 0.16)";
  markCtx.textAlign = "center";

  const stamp = `${session.name.toUpperCase()} • PRIVATE FOLIO • UNLICENSED REPRODUCTION PROHIBITED`;
  const stepX = 400 * dpr;
  const stepY = 240 * dpr;

  for (let x = -markCanvas.width; x < markCanvas.width * 2; x += stepX) {
    for (let y = -markCanvas.height; y < markCanvas.height * 2; y += stepY) {
      markCtx.fillText(stamp, x, y);
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
        const session = getSession() || { name: "Student" };
        renderPDFPage(currentPage, docCanvas, markCanvas, docCtx, markCtx, session);
      }
    }
  }, { passive: true });

  container.addEventListener("touchend", (e) => {
    if (e.touches.length < 2) isPinching = false;
  });
}

// 10. ShreyanCat Companion Talisman
function initShreyanCatBot() {
  const botHost = document.createElement("div");
  botHost.id = "shreyanCatWidget";
  botHost.innerHTML = `
    <div id="catBubbleBtn" class="cat-floating-bubble" title="Summon ShreyanCat">
      <span class="cat-face-icon">⚜️</span>
      <span class="cat-active-beacon"></span>
    </div>

    <div id="catChatWindow" class="cat-chat-window" style="display: none;">
      <div class="cat-chat-header">
        <div class="cat-brand-wrap">
          <span>🐾</span>
          <div>
            <strong>ShreyanCat</strong>
            <small>Atelier Academic Assistant</small>
          </div>
        </div>
        <button id="catCloseBtn" class="cat-close-btn">&times;</button>
      </div>

      <div class="cat-chat-body" id="catChatBody">
        <div class="cat-msg bot">
          Welcome to the atelier! 🐾 I am <strong>ShreyanCat</strong>. How may I assist your examination routine or batch timetable today?
        </div>
      </div>

      <div class="cat-chips-bar">
        <button class="chip-item" data-q="batch">Class Timings</button>
        <button class="chip-item" data-q="paper">Weekly Folios</button>
        <button class="chip-item" data-q="joke">Cat Wit</button>
        <button class="chip-item" data-q="fees">Fees Info</button>
      </div>

      <form id="catChatForm" class="cat-input-bar">
        <input type="text" id="catInput" placeholder="Consult ShreyanCat..." autocomplete="off">
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
      return "Class batches assemble Tuesday & Friday (5:00 PM) or Wednesday & Saturday (5:30 PM). Sunday assessment sessions start at 9:00 AM sharp! ⚜️";
    }
    if (s.includes("paper") || s.includes("test") || s.includes("exam") || s.includes("omr")) {
      return "Examination folios are accessible under the <strong>Assessment Paper</strong> tab. Review on-screen and bring blank 50-mark OMR sheets on Sunday.";
    }
    if (s.includes("joke") || s.includes("funny") || s.includes("laugh")) {
      return "Why did the cat sit on the parchment? It wanted to leave an indelible impression. 🐾📜";
    }
    if (s.includes("fee") || s.includes("due") || s.includes("lock") || s.includes("pay")) {
      return "If access to question folios is on hold, ask your parents to drop a quick WhatsApp note to Swati Ma'am to update the ledger! 💬";
    }
    if (s.includes("who made") || s.includes("developer") || s.includes("creator") || s.includes("cat")) {
      return "This study salon was custom crafted by <strong>ShreyanCat</strong>! 🐾⚡";
    }
    return "Noted. Check the class notice plinth on your overview desk or consult Swati Ma'am during batch hours. ⚜️";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) return;
    addMsg("user", val);
    input.value = "";
    setTimeout(() => addMsg("bot", getReply(val)), 300);
  });

  document.querySelectorAll(".chip-item").forEach(c => {
    c.addEventListener("click", () => {
      const q = c.getAttribute("data-q");
      addMsg("user", c.textContent);
      setTimeout(() => addMsg("bot", getReply(q)), 250);
    });
  });
}

// 11. Security Protection
function initSecurity() {
  const canvasBox = document.getElementById("canvasViewport");
  const blurShield = document.getElementById("securityBlurScreen");

  if (!canvasBox || !blurShield) return;

  // Keep screen black by default
  blurShield.style.display = "flex";
  blurShield.innerHTML = `
    <div style="text-align: center; color: #fff; padding: 1.5rem;">
      <p style="font-size: 1.8rem; margin-bottom: 0.5rem;">👆</p>
      <p style="font-size: 1.1rem; font-weight: bold; margin-bottom: 0.3rem;">Press & Hold to Read</p>
      <p style="font-size: 0.8rem; color: #94a3b8;">Lifting finger snaps screen black to protect assessment content.</p>
    </div>
  `;

  // Reveal only while finger is actively held down
  canvasBox.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      blurShield.style.display = "none";
    }
  }, { passive: true });

  // Snap black the millisecond finger moves away or lifts
  ["touchend", "touchcancel"].forEach(evt => {
    canvasBox.addEventListener(evt, () => {
      blurShield.style.display = "flex";
    }, { passive: true });
  });

  // Block right-clicks and PC screenshot keys
  document.addEventListener("contextmenu", e => e.preventDefault());
  window.addEventListener("blur", () => { blurShield.style.display = "flex"; });
}

// 12. Main Bootstrapper
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initSecurity();
  initPawTrail();
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
        const session = getSession() || { name: "Student" };
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
        const session = getSession() || { name: "Student" };
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
        const session = getSession() || { name: "Student" };
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
        const session = getSession() || { name: "Student" };
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
