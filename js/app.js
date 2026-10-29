/* ==========================================================================
   TUITION STUDY PORTAL - ZERO-TOKEN MASTER ENGINE
   Features:
   - Fixed Home Screen Router on Login
   - Dedicated Faculty Desk tab shown exclusively for Admin
   - Live roster & paper catalog fetched directly from GitHub repository files
   - Retina High-DPI Canvas Rendering with Dynamic Width Scaling (No 100% Clamp)
   - Smooth Mobile Pinch-to-Zoom & Horizontal/Vertical Swiping (100% to 300%)
   - Direct WhatsApp doubt routing (no server required)
   - ShreyanCat Companion & Desktop Paw Trail
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

  // Check live status
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
    greet.textContent = isAdmin ? "Welcome Swati Ma'am!" : `Welcome back, ${session.name}!`;
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
      feeMsg.innerHTML = `Hello <strong>${session.name}</strong>, your evaluation portal is temporarily on hold because tuition fees for <strong>${session.pendingMonths || "recent months"}</strong> are pending.<br><br>Please clear dues with Swati Ma'am to unlock.`;
    }
    if (feeWaBtn) {
      feeWaBtn.href = `https://wa.me/${SWATI_MAAM_PHONE}?text=${encodeURIComponent("Hello Swati Ma'am, I am " + session.name + ". I am writing regarding my pending tuition fees.")}`;
    }
  }

  // Navigate to appropriate starting tab
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

  tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Fetching directory...</td></tr>`;
  const roster = await getLiveRoster();

  tbody.innerHTML = "";
  for (const [key, student] of Object.entries(roster)) {
    if (key === "admin") continue;
    const tr = document.createElement("tr");

    const statusBadge = student.feesPaid
      ? `<span style="background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; padding: 0.2rem 0.55rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700;">✅ Paid (Unlocked)</span>`
      : `<span style="background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; padding: 0.2rem 0.55rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700;">❌ Dues Pending (Locked)</span>`;

    tr.innerHTML = `
      <td><strong>${student.name}</strong></td>
      <td><code>${student.pin}</code></td>
      <td>${statusBadge}</td>
      <td><small style="color: var(--text-muted);">${student.pendingMonths || "None"}</small></td>
    `;
    tbody.appendChild(tr);
  }
}

// 6. Desktop-Only Cat Paw Trail Effect
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

// 7. Discussion Lounge
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
        localStorage.setItem("tuition_discussions_clean", JSON.stringify(discussions));
        renderDiscussions();
      }
    });
  });
}

// 8. Student Notes Routing Directly to WhatsApp
function initFeedback() {
  const form = document.getElementById("feedbackForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = document.getElementById("feedbackText").value.trim();
    const session = getSession();
    if (!text || !session) return;

    const waUrl = `https://wa.me/${SWATI_MAAM_PHONE}?text=${encodeURIComponent("Student Doubt from " + session.name + ":\n" + text)}`;
    window.open(waUrl, "_blank");
    form.reset();
  });
}

// 9. PDF.js Viewer with High-DPI Canvas Sharpening, Zoom (up to 300%) & Pinch
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
    docCanvas.style.width = "100%";
    docCanvas.style.height = "auto";
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

  markCtx.clearRect(0, 0, markCanvas.width, markCanvas.height);
  markCtx.save();
  markCtx.rotate((-25 * Math.PI) / 180);
  markCtx.font = `bold ${24 * dpr}px sans-serif`;
  markCtx.fillStyle = "rgba(220, 38, 38, 0.13)";
  markCtx.textAlign = "center";

  const stamp = `${session.name.toUpperCase()} • PRIVATE ASSESSMENT • CONFIDENTIAL`;
  const stepX = 360 * dpr;
  const stepY = 220 * dpr;

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
    if (e.touches.length < 2) {
      isPinching = false;
    }
  });
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
      return "Weekly mock papers are in the <strong>Sample Paper</strong> tab! Check questions on-screen and bring your blank 50-mark OMR sheets on Sunday.";
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
        // Clear conflicting cached session keys
        localStorage.removeItem("tuition_session_v5");
        localStorage.setItem("tuition_session_clean", JSON.stringify({
          id: name,
          name: student.name,
          feesPaid: student.feesPaid,
          pendingMonths: student.pendingMonths
        }));

        await checkAuthAndRender();
      } else {
        err.textContent = "Invalid name or PIN. Please ask Swati Ma'am.";
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
