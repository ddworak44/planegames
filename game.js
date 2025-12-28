const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// Resize canvas to match window size (minus 10px padding on each side)
function resizeCanvas() {
  canvas.width = window.innerWidth - 20; // 10px left + 10px right
  canvas.height = window.innerHeight - 20; // 10px top + 10px bottom
}

// Resize on load and resize events
window.addEventListener("load", resizeCanvas);
window.addEventListener("resize", resizeCanvas);

// Click handler
canvas.addEventListener("click", (e) => {
  // Get click position relative to canvas
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Draw red dot
  ctx.fillStyle = "rgb(211,56,51)";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();

  // Position button at click location
  const button = document.getElementById("button");
  button.style.left = x + "px";
  button.style.top = y + "px";
  button.style.display = "block"; // Show it
});

// Save as PNG button handler
document.getElementById("save-button").addEventListener("click", () => {
  // Convert canvas to PNG data URI
  const dataUrl = canvas.toDataURL("image/png");

  // Create a download link
  const link = document.createElement("a");
  link.download = "constellation-screenshot.png";
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
