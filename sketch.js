let textBlocks = [];
let glitchIntensity = 0;
let mouseInfluence = 0;
let censorBars = [];
let noiseOffset = 0;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("canvas-container");

  // Calculate responsive font size based on screen width
  let baseFontSize = min(width * 0.08, height * 0.08, 72);

  // Initialize text blocks with new 4-line layout
  textBlocks = [
    {
      text: "ALGORITHMIC",
      x: width * 0.1,
      y: height * 0.25,
      size: baseFontSize,
      align: "left",
      glitched: false,
      censorLevel: 0.7,
      censorWidth: 0,
      targetCensorWidth: 0,
      effect: "algorithmic",
      censorStartChar: 0,
      censorEndChar: 0,
      targetStartChar: 0,
      targetEndChar: 0,
      animationTimer: 0,
      animationDuration: random(120, 180),
      isHovered: false,
    },
    {
      text: "CENSORSHIP",
      x: width * 0.9,
      y: height * 0.4,
      size: baseFontSize * 0.9,
      align: "right",
      glitched: true,
      censorLevel: 0.9,
      censorWidth: 0,
      targetCensorWidth: 0,
      effect: "blur",
      censorStartChar: 0,
      censorEndChar: 0,
      targetStartChar: 0,
      targetEndChar: 0,
      animationTimer: 0,
      animationDuration: random(120, 180),
      isHovered: false,
    },
    {
      text: "RESISTANCE",
      x: width * 0.1,
      y: height * 0.55,
      size: baseFontSize,
      align: "left",
      glitched: false,
      censorLevel: 0.3,
      censorWidth: 0,
      targetCensorWidth: 0,
      effect: "resistance",
      censorStartChar: 0,
      censorEndChar: 0,
      targetStartChar: 0,
      targetEndChar: 0,
      animationTimer: 0,
      animationDuration: random(120, 180),
      isHovered: false,
    },
    {
      text: "TOOLKIT",
      x: width * 0.9,
      y: height * 0.7,
      size: baseFontSize,
      align: "right",
      glitched: false,
      censorLevel: 0.5,
      censorWidth: 0,
      targetCensorWidth: 0,
      effect: "normal",
      censorStartChar: 0,
      censorEndChar: 0,
      targetStartChar: 0,
      targetEndChar: 0,
      animationTimer: 0,
      animationDuration: random(120, 180),
      isHovered: false,
    },
  ];

  // Initialize each block's random censor position
  for (let block of textBlocks) {
    resetCensorAnimation(block);
  }

  // Initialize background censor bars following row structure
  // Define row positions based on text layout
  let rowPositions = [
    height * 0.15, // Above ALGORITHMIC
    height * 0.32, // Between ALGORITHMIC and CENSORSHIP
    height * 0.47, // Between CENSORSHIP and RESISTANCE
    height * 0.62, // Between RESISTANCE and TOOLKIT
    height * 0.82, // Below TOOLKIT
  ];

  for (let i = 0; i < 50; i++) {
    let w = random(80, 300);
    let rowIndex = Math.floor(random(rowPositions.length));
    let baseY = rowPositions[rowIndex];

    censorBars.push({
      x: random(-300, width + 300),
      y: baseY + random(-20, 20), // Slight vertical variation within row
      w: w,
      h: random(20, 40),
      originalW: w,
      speed: random(-0.4, 0.6),
      avoidanceRadius: random(50, 100),
      direction: random() < 0.5 ? 1 : -1,
      rowIndex: rowIndex,
      baseY: baseY,
    });
  }
}

function draw() {
  background(245, 245, 240);

  // Update mouse influence
  mouseInfluence = map(mouseX + mouseY, 0, width + height, 0, 1);
  glitchIntensity = mouseInfluence * 10;

  // Update noise offset for organic movement
  noiseOffset += 0.01;

  // Check hover states and update censorship bars for each text block
  updateCensorshipBars();

  // Draw background censor bars
  drawBackgroundCensorBars();

  // Draw text blocks
  for (let block of textBlocks) {
    drawTextBlock(block);
  }

  // Add subtle scan lines effect
  drawScanLines();

  // Draw interaction hint
  if (frameCount < 300) {
    drawHint();
  }
}

function resetCensorAnimation(block) {
  let textLen = block.text.length;
  block.targetStartChar = Math.floor(random(0, textLen - 1));
  block.targetEndChar = Math.floor(random(block.targetStartChar, textLen));
  block.animationTimer = 0;
}

function updateCensorshipBars() {
  for (let block of textBlocks) {
    // Check if mouse is hovering over this text block
    let textWidthValue = getTextWidth(block.text, block.size);
    let textHeight = block.size * 1.2;

    let textX = block.align === "right" ? block.x - textWidthValue : block.x;

    block.isHovered =
      mouseX >= textX &&
      mouseX <= textX + textWidthValue &&
      mouseY >= block.y &&
      mouseY <= block.y + textHeight;

    if (block.isHovered) {
      // Shrink censor bar when hovered
      block.targetStartChar = block.text.length;
      block.targetEndChar = block.text.length;
    } else {
      // Update animation timer
      block.animationTimer++;

      // If animation cycle is complete, reset to new random position
      if (block.animationTimer >= block.animationDuration) {
        resetCensorAnimation(block);
        block.animationDuration = random(120, 240); // Random duration for next cycle
      }
    }

    // Smoothly animate censor position
    block.censorStartChar = lerp(
      block.censorStartChar,
      block.targetStartChar,
      0.08
    );
    block.censorEndChar = lerp(block.censorEndChar, block.targetEndChar, 0.08);
  }
}

function drawBackgroundCensorBars() {
  fill(0); // Solid black, no transparency
  noStroke();

  for (let bar of censorBars) {
    // Move bars in their designated direction
    bar.x += bar.speed * bar.direction * 0.4;

    // Wrap around screen horizontally
    if (bar.x > width + bar.originalW) {
      bar.x = -bar.originalW;
      // Reassign to a random row when wrapping
      let rowPositions = [
        height * 0.15,
        height * 0.32,
        height * 0.47,
        height * 0.62,
        height * 0.82,
      ];
      bar.rowIndex = Math.floor(random(rowPositions.length));
      bar.baseY = rowPositions[bar.rowIndex];
      bar.y = bar.baseY + random(-20, 20);
    } else if (bar.x < -bar.originalW) {
      bar.x = width + bar.originalW;
      // Reassign to a random row when wrapping
      let rowPositions = [
        height * 0.15,
        height * 0.32,
        height * 0.47,
        height * 0.62,
        height * 0.82,
      ];
      bar.rowIndex = Math.floor(random(rowPositions.length));
      bar.baseY = rowPositions[bar.rowIndex];
      bar.y = bar.baseY + random(-20, 20);
    }

    // Occasionally adjust vertical position slightly within row bounds
    if (random() < 0.005) {
      bar.y += random(-10, 10);
      bar.y = constrain(bar.y, bar.baseY - 25, bar.baseY + 25);
    }

    // Calculate distance from mouse to bar center
    let barCenterX = bar.x + bar.w / 2;
    let barCenterY = bar.y + bar.h / 2;
    let distToMouse = dist(mouseX, mouseY, barCenterX, barCenterY);

    // Shrink bar when mouse is nearby
    let targetWidth = bar.originalW;
    if (distToMouse < bar.avoidanceRadius) {
      let shrinkFactor = map(distToMouse, 0, bar.avoidanceRadius, 0.05, 1);
      targetWidth = bar.originalW * shrinkFactor;
    }

    // Smoothly animate width change
    bar.w = lerp(bar.w, targetWidth, 0.12);

    // Draw bar with solid black color
    if (bar.w > 3) {
      rect(bar.x, bar.y, bar.w, bar.h);
    }
  }
}

function getTextWidth(txt, size) {
  textSize(size);
  return textWidth(txt);
}

function drawTextBlock(block) {
  push();

  // Text styling
  textFont("Courier New");
  textSize(block.size);
  textStyle(BOLD);

  // Set alignment
  if (block.align === "right") {
    textAlign(RIGHT, TOP);
  } else {
    textAlign(LEFT, TOP);
  }

  // Apply different effects based on block type
  if (block.effect === "blur") {
    drawBlurredText(block);
  } else if (block.effect === "algorithmic") {
    drawAlgorithmicText(block);
  } else if (block.effect === "resistance") {
    drawResistanceText(block);
  } else {
    fill(0);
    text(block.text, block.x, block.y);
  }

  // Draw character-based censorship bar
  drawCharacterCensorBar(block);

  pop();
}

function drawCharacterCensorBar(block) {
  if (Math.abs(block.censorEndChar - block.censorStartChar) > 0.1) {
    fill(0);

    let charWidth = block.size * 0.6; // Approximate character width for monospace
    let startX, barWidth;

    if (block.align === "right") {
      let totalTextWidth = getTextWidth(block.text, block.size);
      startX = block.x - totalTextWidth + block.censorStartChar * charWidth;
    } else {
      startX = block.x + block.censorStartChar * charWidth;
    }

    barWidth = (block.censorEndChar - block.censorStartChar) * charWidth;
    let barHeight = block.size * 1.1;

    // Add slight glitch effect to censor bar
    let glitchOffset = sin(frameCount * 0.1) * 1;
    rect(startX + glitchOffset, block.y - 2, barWidth, barHeight);
  }
}

function drawBlurredText(block) {
  // Create moderate blur effect
  for (let i = 0; i < 8; i++) {
    fill(0, 50); // Semi-transparent for blur effect
    let offsetX = sin((i * PI) / 4) * 3;
    let offsetY = cos((i * PI) / 4) * 3;
    text(block.text, block.x + offsetX, block.y + offsetY);
  }

  // Additional subtle blur layer
  for (let i = 0; i < 4; i++) {
    fill(0, 30);
    let offsetX = random(-4, 4);
    let offsetY = random(-4, 4);
    text(block.text, block.x + offsetX, block.y + offsetY);
  }

  // Main text
  fill(0, 180);
  text(block.text, block.x, block.y);
}

function drawAlgorithmicText(block) {
  // Main text
  fill(0);
  text(block.text, block.x, block.y);

  // Remove RGB shift effects to keep only pure black
}

function drawResistanceText(block) {
  // Draw text with slight character corruption and movement
  fill(0);

  let charWidth = block.size * 0.6;
  for (let i = 0; i < block.text.length; i++) {
    let char = block.text.charAt(i);
    let charX =
      block.align === "right"
        ? block.x - getTextWidth(block.text, block.size) + i * charWidth
        : block.x + i * charWidth;

    let offsetY = sin(frameCount * 0.02 + i * 0.5) * 1;
    let offsetX = noise(frameCount * 0.01 + i) * 2 - 1;

    // Occasional character corruption - keep pure black
    if (random() < 0.03) {
      char = String.fromCharCode(65 + Math.floor(random(26)));
      fill(0); // Pure black instead of gray
    } else {
      fill(0);
    }

    // Temporarily set alignment for individual characters
    textAlign(LEFT, TOP);
    text(char, charX + offsetX, block.y + offsetY);
  }

  // Add interference lines in pure black
  stroke(0); // Pure black
  strokeWeight(1);
  if (random() < 0.2) {
    let lineY = block.y + random(block.size);
    let textW = getTextWidth(block.text, block.size);
    let startX = block.align === "right" ? block.x - textW : block.x;
    line(startX, lineY, startX + textW, lineY);
  }
  noStroke();
}

function drawScanLines() {
  stroke(0, 15);
  strokeWeight(1);

  for (let y = 0; y < height; y += 6) {
    if (random() < 0.3) {
      line(0, y, width, y);
    }
  }
}

function drawHint() {
  push();
  fill(0, map(frameCount, 0, 300, 255, 0)); // Pure black that fades out
  textAlign(CENTER, BOTTOM);
  textSize(12);
  text("Hover over words to clear censorship", width / 2, height - 30);
  pop();
}

function mousePressed() {
  // Reset all animations on click
  for (let block of textBlocks) {
    resetCensorAnimation(block);
    block.animationDuration = random(60, 180);
  }
}

function keyPressed() {
  if (key === "r" || key === "R") {
    // Reset the system
    setup();
  }

  if (key === " ") {
    // Reset all censor animations
    for (let block of textBlocks) {
      resetCensorAnimation(block);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Calculate new responsive font size
  let baseFontSize = min(width * 0.08, height * 0.08, 72);

  // Reposition text blocks relative to new canvas size
  textBlocks[0].x = width * 0.1;
  textBlocks[0].y = height * 0.25;
  textBlocks[0].size = baseFontSize;

  textBlocks[1].x = width * 0.9;
  textBlocks[1].y = height * 0.4;
  textBlocks[1].size = baseFontSize * 0.9;

  textBlocks[2].x = width * 0.1;
  textBlocks[2].y = height * 0.55;
  textBlocks[2].size = baseFontSize;

  textBlocks[3].x = width * 0.9;
  textBlocks[3].y = height * 0.7;
  textBlocks[3].size = baseFontSize;
}
