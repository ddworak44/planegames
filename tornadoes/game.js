const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// Resize canvas to match window size (minus 10px padding on each side)
function resizeCanvas() {
  canvas.width = window.innerWidth - 20; // 10px left + 10px right
  canvas.height = window.innerHeight - 20; // 10px top + 10px bottom
}

// Resize on load and resize events
window.addEventListener("load", () => {
  resizeCanvas();
  // Initialize tornado position to center on first load
  if (tornado.x === 0) {
    tornado.x = canvas.width / 2;
  }
});
window.addEventListener("resize", () => {
  const oldCenter = tornado.x - canvas.width / 2;
  resizeCanvas();
  // Maintain relative position, but clamp to bounds
  tornado.x = canvas.width / 2 + oldCenter;
});

// Generate random a-z character
function randomChar() {
  return String.fromCharCode(97 + Math.floor(Math.random() * 26)); // a-z
}

// Tornado state - each level is an array of characters
// Level 0 has length 1, level 1 has length 2, etc.
const tornado = {
  levels: [["A"]], // Start with level 0 = ["A"]
  maxLevels: 10, // Maximum 10 levels (0-9)
  x: 0, // Horizontal position (will be set to center initially)
  y: 0, // Will be set to bottom of canvas
  rotation: 0, // Current rotation angle in radians
  spinSpeed: 0, // Current spin speed (positive = right, negative = left)
  spinDecay: 0.95, // How quickly spin slows down
  velocityX: 0, // Horizontal velocity (positive = right, negative = left)
  velocityDecay: 0.92, // How quickly horizontal movement slows down
  maxWidth: 0, // Maximum width of tornado (calculated from levels)
};

// Key state tracking
const keys = {
  a: false,
  d: false,
};

// Handle key down
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (key === "a") {
    keys.a = true;
    // Spin left: rotate each level left and add random char to right
    spinTornadoLeft();
  } else if (key === "d") {
    keys.d = true;
    // Spin right: rotate each level right and add random char to left
    spinTornadoRight();
  }
});

// Handle key up
document.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  if (key === "a") {
    keys.a = false;
  } else if (key === "d") {
    keys.d = false;
  }
});

// Spin tornado left (A key)
function spinTornadoLeft() {
  // Rotate each existing level left and replace last char with random
  tornado.levels.forEach((level, index) => {
    // Rotate left: move first char to end
    const firstChar = level.shift();
    level.push(firstChar);
    // Replace last character with random (maintains length)
    level[level.length - 1] = randomChar();
  });

  // Add new level if we haven't reached max
  if (tornado.levels.length < tornado.maxLevels) {
    const newLevelIndex = tornado.levels.length;
    const newLevel = [];
    // Fill with random chars, length = newLevelIndex + 1
    for (let i = 0; i <= newLevelIndex; i++) {
      newLevel.push(randomChar());
    }
    tornado.levels.push(newLevel);
  }

  // Update spin speed (rotation)
  tornado.spinSpeed -= 0.05;

  // Move tornado left
  tornado.velocityX -= 2;
}

// Spin tornado right (D key)
function spinTornadoRight() {
  // Rotate each existing level right and replace first char with random
  tornado.levels.forEach((level, index) => {
    // Rotate right: move last char to beginning
    const lastChar = level.pop();
    level.unshift(lastChar);
    // Replace first character with random (maintains length)
    level[0] = randomChar();
  });

  // Add new level if we haven't reached max
  if (tornado.levels.length < tornado.maxLevels) {
    const newLevelIndex = tornado.levels.length;
    const newLevel = [];
    // Fill with random chars, length = newLevelIndex + 1
    for (let i = 0; i <= newLevelIndex; i++) {
      newLevel.push(randomChar());
    }
    tornado.levels.push(newLevel);
  }

  // Update spin speed (rotation)
  tornado.spinSpeed += 0.05;

  // Move tornado right
  tornado.velocityX += 2;
}

// Draw the tornado made of ASCII characters
function drawTornado() {
  ctx.save();

  // Move to tornado position (center bottom)
  ctx.translate(tornado.x, tornado.y);

  // Set font properties
  ctx.font = "bold 20px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Calculate tornado dimensions
  const maxLevels = tornado.levels.length;
  const levelHeight = 35; // Height per level
  const baseWidth = 30; // Base width
  const topWidthMultiplier = 2.5; // How much wider at top

  // Draw each level
  tornado.levels.forEach((level, levelIndex) => {
    const y = -levelIndex * levelHeight; // Position from bottom
    const t = levelIndex / Math.max(maxLevels - 1, 1); // 0 to 1
    const width = baseWidth + (baseWidth * topWidthMultiplier - baseWidth) * t;

    // Calculate character positions in a circle/spiral
    const numChars = level.length;
    const angleStep = (Math.PI * 2) / numChars;

    // Add spiral offset based on rotation
    const spiralOffset = tornado.rotation * 2;

    level.forEach((char, charIndex) => {
      // Calculate angle for this character
      const angle = charIndex * angleStep + spiralOffset;

      // Calculate position on circle
      const radius = width / 2;
      const x = Math.cos(angle) * radius;
      const charY = y + Math.sin(angle) * radius * 0.3; // Flatten vertically

      // Draw character
      ctx.fillStyle = `rgba(0, 0, 0, ${0.9 - t * 0.3})`; // Darker at bottom
      ctx.fillText(char.toUpperCase(), x, charY);
    });
  });

  ctx.restore();
}

// Draw background
function drawBackground() {
  // Sky gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#87CEEB"); // Sky blue at top
  gradient.addColorStop(1, "#E0E0E0"); // Light gray at bottom

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ground
  ctx.fillStyle = "#8B7355"; // Brown/tan ground
  ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
}

// Calculate maximum width of tornado
function calculateMaxWidth() {
  const baseWidth = 30;
  const topWidthMultiplier = 2.5;
  const maxLevels = tornado.levels.length;
  if (maxLevels === 0) return baseWidth;
  const topWidth = baseWidth + (baseWidth * topWidthMultiplier - baseWidth);
  return Math.max(baseWidth, topWidth);
}

// Animation loop
function animate() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  drawBackground();

  // Calculate tornado max width for boundary checking
  tornado.maxWidth = calculateMaxWidth();
  const halfWidth = tornado.maxWidth / 2;
  const borderPadding = 10; // Keep some padding from edges

  // Update horizontal position based on velocity
  tornado.x += tornado.velocityX;

  // Clamp tornado position to stay within canvas bounds
  tornado.x = Math.max(
    halfWidth + borderPadding,
    Math.min(canvas.width - halfWidth - borderPadding, tornado.x)
  );

  // Decay horizontal velocity
  tornado.velocityX *= tornado.velocityDecay;

  // Stop very small movements
  if (Math.abs(tornado.velocityX) < 0.1) {
    tornado.velocityX = 0;
  }

  // Update vertical position (always at bottom)
  tornado.y = canvas.height - 50;

  // Update rotation based on spin speed
  tornado.rotation += tornado.spinSpeed;

  // Decay spin speed
  tornado.spinSpeed *= tornado.spinDecay;

  // Draw tornado
  drawTornado();

  // Continue animation
  requestAnimationFrame(animate);
}

// Initialize
window.addEventListener("load", () => {
  resizeCanvas();
  // Initialize tornado position to center
  tornado.x = canvas.width / 2;
  tornado.y = canvas.height - 50;
  // Start animation loop
  animate();
});
