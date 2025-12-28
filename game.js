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

// Draw the night sky background (once)
function drawNightSky() {
  console.log("adding sky");
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Create gradient background: indigo to near-black
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#1a1a40"); // top: deep indigo
  gradient.addColorStop(1, "#121212"); // bottom: near-black

  // Fill background
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Optional: Add faint shimmer (static, non-destructive)
  const shimmerGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  shimmerGradient.addColorStop(0, "#2a2a50");
  shimmerGradient.addColorStop(1, "#3a3a60");

  // Draw shimmer overlay with very low alpha (0.08) for ethereal glow
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = shimmerGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1.0; // Reset alpha for next draws
  console.log("ending sky");
}

// Click handler
canvas.addEventListener("click", (e) => {
  // Get click position relative to canvas
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Draw red star (dot)
  ctx.fillStyle = "rgb(211,56,51)"; // Deep red, like a star
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

window.addEventListener("load", () => {
  resizeCanvas();
  drawNightSky(); // Draw the night sky background
});

// Resize on resize events
window.addEventListener("resize", resizeCanvas);
