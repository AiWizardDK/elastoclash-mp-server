// js/stars.js

let stars = [];

// Opret tilfældige stjerner til baggrund eller collectibles
export function generateStars(count = 20, w = 1280, h = 720) {
  stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 8 + Math.random() * 16,
      collected: false,
      z: Math.random() // Dybde for parallax
    });
  }
}

// Tegn stjernerne (kaldes i render loop)
export function renderStars(ctx, cameraX = 0, cameraY = 0) {
  stars.forEach(s => {
    if (s.collected) return;
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      let angle = ((i * 2) / 5) * Math.PI;
      ctx.lineTo(
        s.x + (s.r * Math.cos(angle) - cameraX * s.z),
        s.y + (s.r * Math.sin(angle) - cameraY * s.z)
      );
    }
    ctx.closePath();
    ctx.fillStyle = "#ff0";
    ctx.shadowColor = "#fffb";
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.restore();
  });
}

// Tjek om spilleren rammer en stjerne
export function checkCollectStars(playerX, playerY, radius = 20) {
  let got = 0;
  stars.forEach(s => {
    if (s.collected) return;
    const dx = playerX - s.x;
    const dy = playerY - s.y;
    if (dx * dx + dy * dy < (radius + s.r) * (radius + s.r)) {
      s.collected = true;
      got++;
    }
  });
  return got;
}

// Reset alle stjerner (til ny bane)
export function resetStars() {
  stars.forEach(s => { s.collected = false; });
}

// Få alle stjerner (fx til UI/score)
export function getStars() {
  return stars;
}
