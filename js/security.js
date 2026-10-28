(function () {
  // 1. Block right-click menu
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    return false;
  });

  // 2. Block shortcut combinations (Print, Save, Inspect, Source)
  document.addEventListener("keydown", (e) => {
    // Print: Ctrl+P or Cmd+P
    if ((e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "P")) {
      e.preventDefault();
      alert("Printing is disabled for weekly test papers.");
      return false;
    }

    // Save Page: Ctrl+S or Cmd+S
    if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
      e.preventDefault();
      return false;
    }

    // View Source: Ctrl+U
    if ((e.ctrlKey || e.metaKey) && (e.key === "u" || e.key === "U")) {
      e.preventDefault();
      return false;
    }

    // Developer tools: F12 or Ctrl+Shift+I / J / C
    if (
      e.key === "F12" ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase()))
    ) {
      e.preventDefault();
      return false;
    }
  });

  // 3. Screen Blur Shield on window blur (Snipping Tool & window switching)
  const blurOverlay = document.getElementById("securityBlurScreen");

  window.addEventListener("blur", () => {
    if (blurOverlay) blurOverlay.style.display = "flex";
  });

  window.addEventListener("focus", () => {
    if (blurOverlay) blurOverlay.style.display = "none";
  });

  // 4. Invalidate clipboard on copy
  document.addEventListener("copy", (e) => {
    e.clipboardData.setData("text/plain", "Assessment content cannot be copied.");
    e.preventDefault();
  });
})();
