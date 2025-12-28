const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// Resize canvas to match window size (minus 10px padding on each side)
function resizeCanvas() {
  canvas.width = window.innerWidth - 20; // 10px left + 10px right
  canvas.height = window.innerHeight - 20; // 10px top + 10px bottom
}

// Resize event handler
window.addEventListener("resize", () => {
  const oldCenter1 = tornado1.x - canvas.width / 2;
  const oldCenter2 = tornado2.x - canvas.width / 2;
  resizeCanvas();
  // Maintain relative positions, but clamp to bounds
  tornado1.x = canvas.width / 2 + oldCenter1;
  tornado2.x = canvas.width / 2 + oldCenter2;
});

// Generate random a-z character (for player 1)
function randomChar() {
  return String.fromCharCode(97 + Math.floor(Math.random() * 26)); // a-z
}

// Generate random 0-9 character (for player 2)
function randomDigit() {
  return String.fromCharCode(48 + Math.floor(Math.random() * 10)); // 0-9
}

// Tornado state - each level is an array of characters
// Level 0 has length 1, level 1 has length 2, etc.
const tornado1 = {
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

const tornado2 = {
  levels: [["0"]], // Start with level 0 = ["0"]
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
  w: false,
  s: false,
  arrowLeft: false,
  arrowRight: false,
  arrowUp: false,
  arrowDown: false,
};

// Projectiles array
const projectiles = [];

// Handle key down
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (key === "a") {
    keys.a = true;
    // Player 1: Spin left
    spinTornadoLeft(tornado1, randomChar);
  } else if (key === "d") {
    keys.d = true;
    // Player 1: Spin right
    spinTornadoRight(tornado1, randomChar);
  } else if (key === "w") {
    if (!keys.w) {
      keys.w = true;
      // Player 1: Shoot
      shootProjectile(tornado1, tornado2, randomChar);
    }
  } else if (key === "s") {
    keys.s = true;
    // Player 1: Duck (remove top layer)
    duckTornado(tornado1);
  } else if (e.key === "ArrowLeft") {
    keys.arrowLeft = true;
    // Player 2: Spin left
    spinTornadoLeft(tornado2, randomDigit);
  } else if (e.key === "ArrowRight") {
    keys.arrowRight = true;
    // Player 2: Spin right
    spinTornadoRight(tornado2, randomDigit);
  } else if (e.key === "ArrowUp") {
    if (!keys.arrowUp) {
      keys.arrowUp = true;
      // Player 2: Shoot
      shootProjectile(tornado2, tornado1, randomDigit);
    }
  } else if (e.key === "ArrowDown") {
    keys.arrowDown = true;
    // Player 2: Duck (remove top layer)
    duckTornado(tornado2);
  }
});

// Handle key up
document.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  if (key === "a") {
    keys.a = false;
  } else if (key === "d") {
    keys.d = false;
  } else if (key === "w") {
    keys.w = false;
  } else if (key === "s") {
    keys.s = false;
  } else if (e.key === "ArrowLeft") {
    keys.arrowLeft = false;
  } else if (e.key === "ArrowRight") {
    keys.arrowRight = false;
  } else if (e.key === "ArrowUp") {
    keys.arrowUp = false;
  } else if (e.key === "ArrowDown") {
    keys.arrowDown = false;
  }
});

// Spin tornado left (A key or ArrowLeft)
function spinTornadoLeft(tornado, randomCharFunc) {
  // Rotate each existing level left and replace last char with random
  tornado.levels.forEach((level, index) => {
    // Rotate left: move first char to end
    const firstChar = level.shift();
    level.push(firstChar);
    // Replace last character with random (maintains length)
    level[level.length - 1] = randomCharFunc();
  });

  // Add new level if we haven't reached max
  if (tornado.levels.length < tornado.maxLevels) {
    const newLevelIndex = tornado.levels.length;
    const newLevel = [];
    // Fill with random chars, length = newLevelIndex + 1
    for (let i = 0; i <= newLevelIndex; i++) {
      newLevel.push(randomCharFunc());
    }
    tornado.levels.push(newLevel);
  }

  // Update spin speed (rotation)
  tornado.spinSpeed -= 0.05;

  // Move tornado left
  tornado.velocityX -= 2;
}

// Spin tornado right (D key or ArrowRight)
function spinTornadoRight(tornado, randomCharFunc) {
  // Rotate each existing level right and replace first char with random
  tornado.levels.forEach((level, index) => {
    // Rotate right: move last char to beginning
    const lastChar = level.pop();
    level.unshift(lastChar);
    // Replace first character with random (maintains length)
    level[0] = randomCharFunc();
  });

  // Add new level if we haven't reached max
  if (tornado.levels.length < tornado.maxLevels) {
    const newLevelIndex = tornado.levels.length;
    const newLevel = [];
    // Fill with random chars, length = newLevelIndex + 1
    for (let i = 0; i <= newLevelIndex; i++) {
      newLevel.push(randomCharFunc());
    }
    tornado.levels.push(newLevel);
  }

  // Update spin speed (rotation)
  tornado.spinSpeed += 0.05;

  // Move tornado right
  tornado.velocityX += 2;
}

// Duck tornado (S key or ArrowDown) - remove top layer
function duckTornado(tornado) {
  // Only remove if there's more than just the base level
  if (tornado.levels.length > 1) {
    tornado.levels.pop(); // Remove top level
  }
}

// Shoot projectile (W key or ArrowUp)
function shootProjectile(shooter, target, randomCharFunc) {
  // Calculate projectile starting position (top of shooter tornado)
  const shooterHeight = shooter.levels.length * 35; // levelHeight
  const startX = shooter.x;
  const startY = shooter.y - shooterHeight;

  // Calculate direction to target
  const dx = target.x - startX;
  const dy = target.y - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const speed = 8; // Projectile speed

  // Create projectile
  const projectile = {
    x: startX,
    y: startY,
    vx: (dx / distance) * speed,
    vy: (dy / distance) * speed,
    shooter: shooter, // Reference to who shot it
    target: target, // Reference to target
    char: randomCharFunc(), // Character to display
    radius: 8, // Collision radius
    lifetime: 300, // Frames before it disappears
  };

  projectiles.push(projectile);
}

// Draw the tornado made of ASCII characters
function drawTornado(tornado) {
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
function calculateMaxWidth(tornado) {
  const baseWidth = 30;
  const topWidthMultiplier = 2.5;
  const maxLevels = tornado.levels.length;
  if (maxLevels === 0) return baseWidth;
  const topWidth = baseWidth + (baseWidth * topWidthMultiplier - baseWidth);
  return Math.max(baseWidth, topWidth);
}

// Update tornado physics
function updateTornado(tornado) {
  // Calculate tornado max width for boundary checking
  tornado.maxWidth = calculateMaxWidth(tornado);
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
}

// Update projectiles
function updateProjectiles() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];

    // Update position
    proj.x += proj.vx;
    proj.y += proj.vy;

    // Decrease lifetime
    proj.lifetime--;

    // Remove if expired or out of bounds
    if (
      proj.lifetime <= 0 ||
      proj.x < 0 ||
      proj.x > canvas.width ||
      proj.y < 0 ||
      proj.y > canvas.height
    ) {
      projectiles.splice(i, 1);
      continue;
    }

    // Check collision with target tornado
    const target = proj.target;
    const targetHeight = target.levels.length * 35;
    const targetTopY = target.y - targetHeight;
    const targetBottomY = target.y;

    // Check if projectile is within tornado bounds
    const dx = proj.x - target.x;
    const dy = proj.y - target.y;
    const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

    // Calculate tornado width at projectile's height
    const t = Math.max(0, Math.min(1, (proj.y - targetTopY) / targetHeight));
    const baseWidth = 30;
    const topWidthMultiplier = 2.5;
    const widthAtHeight =
      baseWidth + (baseWidth * topWidthMultiplier - baseWidth) * (1 - t);
    const radiusAtHeight = widthAtHeight / 2;

    // Check collision
    if (
      proj.y >= targetTopY &&
      proj.y <= targetBottomY &&
      distanceFromCenter <= radiusAtHeight + proj.radius
    ) {
      // Hit! Remove top layer of target
      if (target.levels.length > 1) {
        target.levels.pop();
      }
      // Remove projectile
      projectiles.splice(i, 1);
    }
  }
}

// Draw projectiles
function drawProjectiles() {
  projectiles.forEach((proj) => {
    ctx.save();
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255, 0, 0, 0.9)"; // Red projectiles
    ctx.fillText(proj.char.toUpperCase(), proj.x, proj.y);
    ctx.restore();
  });
}

// Animation loop
function animate() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  drawBackground();

  // Update both tornadoes
  updateTornado(tornado1);
  updateTornado(tornado2);

  // Update projectiles
  updateProjectiles();

  // Draw projectiles
  drawProjectiles();

  // Draw both tornadoes
  drawTornado(tornado1);
  drawTornado(tornado2);

  // Continue animation
  requestAnimationFrame(animate);
}

// Initialize
window.addEventListener("load", () => {
  resizeCanvas();
  // Initialize tornado positions
  tornado1.x = canvas.width / 3; // Left third
  tornado1.y = canvas.height - 50;
  tornado2.x = (canvas.width * 2) / 3; // Right third
  tornado2.y = canvas.height - 50;
  // Start animation loop
  animate();
});
