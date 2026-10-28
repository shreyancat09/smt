document.addEventListener("DOMContentLoaded", () => {
  const docCanvas = document.getElementById("documentCanvas");
  const markCanvas = document.getElementById("watermarkCanvas");

  if (!docCanvas || !markCanvas) return;

  const docCtx = docCanvas.getContext("2d");
  const markCtx = markCanvas.getContext("2d");

  const session = JSON.parse(localStorage.getItem("tuition_session") || '{"name":"Student","batch":"General"}');
  
  let currentPage = 1;
  const totalPages = 2;
  let zoom = 1.0;

  // Structured assessment content rendered onto the canvas
  const samplePages = {
    1: [
      { type: "header", text: "CLASS 10 - SOCIAL SCIENCE WEEKLY BENCHMARK" },
      { type: "sub", text: "Time Allowed: 45 Mins | Maximum Marks: 25 | Batch Assessment" },
      { type: "divider" },
      { type: "section", text: "SECTION A: MULTIPLE CHOICE & OBJECTIVE (1 Mark each)" },
      { type: "q", num: "Q1.", text: "Which of the following treaties recognized Greece as an independent nation?" },
      { type: "opt", text: "(a) Treaty of Vienna of 1815      (b) Treaty of Constantinople of 1832" },
      { type: "opt", text: "(c) Treaty of Versailles            (d) Treaty of Frankfurt" },
      { type: "q", num: "Q2.", text: "Identify the crop that requires 210 frost-free days and bright sunshine for its growth:" },
      { type: "opt", text: "(a) Jute       (b) Cotton       (c) Tea       (d) Rubber" },
      { type: "section", text: "SECTION B: SHORT REASONING (3 Marks each)" },
      { type: "q", num: "Q3.", text: "Explain three principal ways in which the Non-Cooperation Movement unfolded" },
      { type: "body", text: "in cities and urban educational institutions across India." },
      { type: "q", num: "Q4.", text: "Differentiate between Horizontal and Vertical power sharing with concrete institutional examples." }
    ],
    2: [
      { type: "header", text: "CLASS 10 - EVALUATION PAPER (CONTINUED)" },
      { type: "divider" },
      { type: "section", text: "SECTION C: LONG CASE APPLICATION (5 Marks)" },
      { type: "q", num: "Q5.", text: "Analyze why credit at reasonable rates is crucial for a country's economic development." },
      { type: "body", text: "Support your answer by contrasting formal source conditions with informal moneylenders." },
      { type: "q", num: "Q6.", text: "State two political and two administrative consequences of the Partition of Bengal in 1905." }
    ]
  };

  function resizeCanvases() {
    const baseWidth = 850;
    const baseHeight = 1100;

    docCanvas.width = baseWidth * zoom;
    docCanvas.height = baseHeight * zoom;
    markCanvas.width = baseWidth * zoom;
    markCanvas.height = baseHeight * zoom;

    renderDocumentPage(currentPage);
    renderWatermark();
  }

  function renderDocumentPage(pgNum) {
    docCtx.fillStyle = "#ffffff";
    docCtx.fillRect(0, 0, docCanvas.width, docCanvas.height);

    const lines = samplePages[pgNum] || [];
    let y = 60 * zoom;

    lines.forEach(item => {
      docCtx.fillStyle = "#1e293b";
      if (item.type === "header") {
        docCtx.font = `bold ${18 * zoom}px 'Segoe UI', -apple-system, sans-serif`;
        docCtx.textAlign = "center";
        docCtx.fillText(item.text, docCanvas.width / 2, y);
        y += 26 * zoom;
      } else if (item.type === "sub") {
        docCtx.font = `${13 * zoom}px 'Segoe UI', -apple-system, sans-serif`;
        docCtx.fillStyle = "#64748b";
        docCtx.textAlign = "center";
        docCtx.fillText(item.text, docCanvas.width / 2, y);
        y += 20 * zoom;
      } else if (item.type === "divider") {
        docCtx.strokeStyle = "#cbd5e1";
        docCtx.lineWidth = 1;
        docCtx.beginPath();
        docCtx.moveTo(40 * zoom, y);
        docCtx.lineTo(docCanvas.width - 40 * zoom, y);
        docCtx.stroke();
        y += 30 * zoom;
      } else if (item.type === "section") {
        docCtx.font = `bold ${14 * zoom}px 'Segoe UI', -apple-system, sans-serif`;
        docCtx.textAlign = "left";
        docCtx.fillText(item.text, 50 * zoom, y);
        y += 28 * zoom;
      } else if (item.type === "q") {
        docCtx.font = `600 ${14 * zoom}px 'Segoe UI', -apple-system, sans-serif`;
        docCtx.textAlign = "left";
        docCtx.fillText(`${item.num} ${item.text}`, 50 * zoom, y);
        y += 22 * zoom;
      } else if (item.type === "opt" || item.type === "body") {
        docCtx.font = `${13.5 * zoom}px 'Segoe UI', -apple-system, sans-serif`;
        docCtx.textAlign = "left";
        docCtx.fillText(item.text, 70 * zoom, y);
        y += 24 * zoom;
      }
    });
  }

  function renderWatermark() {
    markCtx.clearRect(0, 0, markCanvas.width, markCanvas.height);
    markCtx.save();
    markCtx.rotate((-25 * Math.PI) / 180);
    markCtx.font = `bold ${18 * zoom}px 'Segoe UI', -apple-system, sans-serif`;
    markCtx.fillStyle = "rgba(220, 38, 38, 0.12)";
    markCtx.textAlign = "center";

    const stamp = `${session.name} • ${session.batch} • TUITION CONFIDENTIAL`;
    const stepX = 280 * zoom;
    const stepY = 160 * zoom;

    for (let x = -markCanvas.width; x < markCanvas.width * 2; x += stepX) {
      for (let y = -markCanvas.height; y < markCanvas.height * 2; y += stepY) {
        markCtx.fillText(stamp, x, y);
      }
    }
    markCtx.restore();
  }

  // Page switcher listeners
  document.getElementById("prevPageBtn").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      document.getElementById("currentPageNum").textContent = currentPage;
      resizeCanvases();
    }
  });

  document.getElementById("nextPageBtn").addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      document.getElementById("currentPageNum").textContent = currentPage;
      resizeCanvases();
    }
  });

  // Zoom controls
  document.getElementById("zoomInBtn").addEventListener("click", () => {
    if (zoom < 1.4) {
      zoom += 0.1;
      document.getElementById("zoomLevel").textContent = `${Math.round(zoom * 100)}%`;
      resizeCanvases();
    }
  });

  document.getElementById("zoomOutBtn").addEventListener("click", () => {
    if (zoom > 0.8) {
      zoom -= 0.1;
      document.getElementById("zoomLevel").textContent = `${Math.round(zoom * 100)}%`;
      resizeCanvases();
    }
  });

  document.getElementById("totalPagesNum").textContent = totalPages;
  resizeCanvases();
});
