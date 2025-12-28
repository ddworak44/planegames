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

// Track all stars (as [x, y] centers)
let stars = [];
let lastStarIndex = -1; // Initially no star selected

// NEW: track the immediately previous star
let previousStarIndex = -1;

// Click handler: Draw a white polygon (star) at click point
canvas.addEventListener("click", (e) => {
  // Get click position relative to canvas
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const sides = Math.floor(Math.random() * 5) + 3; // 3 to 9 inclusive
  const radius = 5; // size of the shape

  ctx.beginPath();
  ctx.moveTo(x, y - radius); // start at top

  // Calculate each vertex
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides;
    const nextX = x + Math.cos(angle) * radius;
    const nextY = y + Math.sin(angle) * radius;
    if (i === 0) {
      ctx.moveTo(nextX, nextY);
    } else {
      ctx.lineTo(nextX, nextY);
    }
  }

  ctx.closePath();
  ctx.fillStyle = "rgb(255, 255, 255)";
  ctx.fill();

  // Add to stars array
  stars.push([x, y]);
  lastStarIndex = stars.length - 1; // Update last star index

  // Reset traversal history when placing a new star
  previousStarIndex = -1;

  // Draw border around the current star (if any)
  if (lastStarIndex >= 0) {
    drawCurrentStarBorder();
  }
});

// Function to draw a glowing border around the current star
function drawCurrentStarBorder() {
  if (lastStarIndex < 0) return;

  const centerX = stars[lastStarIndex][0];
  const centerY = stars[lastStarIndex][1];

  // Draw a small glowing ring around the star
  ctx.beginPath();
  ctx.arc(centerX, centerY, 10, 0, Math.PI * 2); // Radius 10px (bigger than star's 5px)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)"; // Soft white glow
  ctx.lineWidth = 2;
  ctx.stroke();
}

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

// Arrow key handler: Connect current star to nearest neighbor
document.addEventListener("keydown", (e) => {
  if (
    e.key === "ArrowUp" ||
    e.key === "ArrowDown" ||
    e.key === "ArrowLeft" ||
    e.key === "ArrowRight"
  ) {
    if (lastStarIndex < 0) return; // No star to start from

    // Find nearest neighbor (excluding self AND previous star)
    let nearestIndex = -1;
    let minDist = Infinity;

    for (let i = 0; i < stars.length; i++) {
      if (i === lastStarIndex) continue; // Avoid connecting to self
      if (i === previousStarIndex) continue; // KEY FIX

      const dist = distance(stars[lastStarIndex], stars[i]);
      if (dist < minDist) {
        minDist = dist;
        nearestIndex = i;
      }
    }

    if (nearestIndex >= 0) {
      // Draw a line from last star to nearest neighbor
      const [lastX, lastY] = stars[lastStarIndex];
      const [nearestX, nearestY] = stars[nearestIndex];

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(nearestX, nearestY);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"; // White line, slightly less bright than star
      ctx.lineWidth = 2;
      ctx.stroke();

      // Update traversal history
      previousStarIndex = lastStarIndex;
      lastStarIndex = nearestIndex;

      drawCurrentStarBorder();
    }
  }
});

// Helper function to calculate Euclidean distance between two points
function distance(p1, p2) {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return Math.sqrt(dx * dx + dy * dy);
}

// Initialize
window.addEventListener("load", () => {
  resizeCanvas();
  drawNightSky(); // Draw the night sky background
});
