document.addEventListener("DOMContentLoaded", async () => {
  // Use Mozilla's standard PDF engine
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  const docCanvas = document.getElementById("documentCanvas");
  const markCanvas = document.getElementById("watermarkCanvas");
  if (!docCanvas || !markCanvas) return;

  const docCtx = docCanvas.getContext("2d");
  const markCtx = markCanvas.getContext("2d");

  // Get current logged-in student name
  const session = JSON.parse(localStorage.getItem("tuition_session") || '{"name":"Student","batch":"General"}');
  
  let pdfDoc = null;
  let currentPage = 1;

  // Loads weekly.pdf directly from your papers folder
  // The "?v=" part forces phones to fetch the new file whenever it's uploaded
  const pdfPath = `./papers/weekly.pdf?v=${Date.now()}`;

  try {
    const loadingTask = pdfjsLib.getDocument(pdfPath);
    pdfDoc = await loadingTask.promise;
    document.getElementById("totalPagesNum").textContent = pdfDoc.numPages;
    renderPage(currentPage);
  } catch (error) {
    showPlaceholder("No active test paper uploaded for this week.");
  }

  async function renderPage(pageNum) {
    if (!pdfDoc) return;
    const page = await pdfDoc.getPage(pageNum);
    
    // Scale for crisp phone and desktop viewing
    const viewport = page.getViewport({ scale: 1.4 });
    docCanvas.width = viewport.width;
    docCanvas.height = viewport.height;
    markCanvas.width = viewport.width;
    markCanvas.height = viewport.height;

    // Draw PDF page to canvas
    await page.render({ canvasContext: docCtx, viewport: viewport }).promise;

    // Draw student watermark on top
    drawWatermark();
  }

  function drawWatermark() {
    markCtx.clearRect(0, 0, markCanvas.width, markCanvas.height);
    markCtx.save();
    markCtx.rotate((-25 * Math.PI) / 180);
    markCtx.font = "bold 20px sans-serif";
    markCtx.fillStyle = "rgba(220, 38, 38, 0.13)";
    markCtx.textAlign = "center";

    const watermarkText = `${session.name} • ${session.batch} • CONFIDENTIAL`;
    for (let x = -markCanvas.width; x < markCanvas.width * 2; x += 300) {
      for (let y = -markCanvas.height; y < markCanvas.height * 2; y += 180) {
        markCtx.fillText(watermarkText, x, y);
      }
    }
    markCtx.restore();
  }

  function showPlaceholder(text) {
    docCanvas.width = 600;
    docCanvas.height = 300;
    docCtx.fillStyle = "#ffffff";
    docCtx.fillRect(0, 0, 600, 300);
    docCtx.fillStyle = "#64748b";
    docCtx.font = "16px sans-serif";
    docCtx.textAlign = "center";
    docCtx.fillText(text, 300, 150);
  }

  // Next / Previous Page Buttons
  document.getElementById("prevPageBtn").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      document.getElementById("currentPageNum").textContent = currentPage;
      renderPage(currentPage);
    }
  });

  document.getElementById("nextPageBtn").addEventListener("click", () => {
    if (pdfDoc && currentPage < pdfDoc.numPages) {
      currentPage++;
      document.getElementById("currentPageNum").textContent = currentPage;
      renderPage(currentPage);
    }
  });
});
