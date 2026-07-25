// Bottle Flip Challenge - core game logic

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const flipBtn = document.getElementById('flipBtn');
const resetBtn = document.getElementById('resetBtn');
const mapSelect = document.getElementById('mapSelect');
const levelDisplay = document.getElementById('level-display');
const mapDisplay = document.getElementById('map-display');
const attemptsDisplay = document.getElementById('attempts');
const scoreDisplay = document.getElementById('score');
const message = document.getElementById('message');

const maps = [
  { name: 'Kitchen Counter', bg: '#f5deb3', target: {x: 600, y: 430, w: 90}, gravity: 0.35 },
  { name: 'Office Desk', bg: '#d2b48c', target: {x: 620, y: 430, w: 75}, gravity: 0.38 },
  { name: 'Skate Park', bg: '#c9c9c9', target: {x: 640, y: 400, w: 60}, gravity: 0.4 },
  { name: 'Rooftop', bg: '#9fd3ff', target: {x: 660, y: 420, w: 55}, gravity: 0.42, wind: 0.15 },
  { name: 'Moving Truck', bg: '#e6e6e6', target: {x: 620, y: 430, w: 65}, gravity: 0.4, shake: true }
];

let currentMapIndex = 0;
let level = 1;
let attempts = 0;
let score = 0;
let bottle, animating = false;

function initBottle() {
  bottle = {
    x: 120, y: 430, w: 22, h: 70,
    vx: 0, vy: 0, angle: 0, angularVel: 0,
    landed: false, standing: false
  };
}

function drawMapBackground(map) {
  ctx.fillStyle = map.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(0, 450, canvas.width, 50);
  ctx.fillStyle = '#5a8f3c';
  ctx.fillRect(map.target.x - map.target.w/2, 430, map.target.w, 20);
  ctx.fillStyle = '#333';
  ctx.font = '14px Arial';
  ctx.fillText('LAND ZONE', map.target.x - 30, 425);
}

function drawBottle(b) {
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(b.angle);
  ctx.fillStyle = 'rgba(100,200,255,0.6)';
  ctx.fillRect(-b.w/2, -b.h/2 + 15, b.w, b.h - 15);
  ctx.fillStyle = '#2a9df4';
  ctx.fillRect(-b.w/2 + 3, -b.h/2 + 5, b.w - 6, 15);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(-b.w/4, -b.h/2 - 8, b.w/2, 10);
  ctx.restore();
}

function render() {
  const map = maps[currentMapIndex];
  drawMapBackground(map);
  drawBottle(bottle);
}

function update() {
  const map = maps[currentMapIndex];
  bottle.vy += map.gravity;
  bottle.x += bottle.vx;
  bottle.y += bottle.vy;
  bottle.angle += bottle.angularVel;
  if (map.wind) bottle.vx += map.wind * (Math.random() - 0.5);

  if (bottle.y >= 430) {
    bottle.y = 430;
    if (!bottle.landed) {
      bottle.landed = true;
      evaluateLanding();
    }
  }
  render();
  if (!bottle.landed) requestAnimationFrame(update);
}

function normalizedAngle(a) {
  let n = a % (2 * Math.PI);
  if (n < 0) n += 2 * Math.PI;
  return Math.min(n, 2 * Math.PI - n);
}

function evaluateLanding() {
  animating = false;
  const map = maps[currentMapIndex];
  const uprightDiff = normalizedAngle(bottle.angle);
  const inZone = Math.abs(bottle.x - map.target.x) < map.target.w / 2;
  const upright = uprightDiff < 0.35;

  if (upright && inZone) {
    const points = 100 + level * 10;
    score += points;
    message.textContent = 'Landed it! Plus ' + points + ' points! On to level ' + (level + 1) + '.';
    level += 1;
    levelDisplay.textContent = 'Level: ' + level;
  } else if (upright && !inZone) {
    message.textContent = 'Stood up but missed the zone. Try again!';
  } else {
    message.textContent = 'Bottle tipped over. Give it another flip!';
  }
  scoreDisplay.textContent = 'Score: ' + score;
}

function flip() {
  if (animating) return;
  animating = true;
  attempts += 1;
  attemptsDisplay.textContent = 'Attempts: ' + attempts;
  message.textContent = '';
  initBottle();
  const power = 8 + Math.min(level, 10) * 0.4;
  bottle.vy = -(11 + Math.random() * 2);
  bottle.vx = 4 + power * 0.3 + (Math.random() - 0.5);
  bottle.angularVel = 0.25 + Math.random() * 0.15;
  requestAnimationFrame(update);
}

function resetLevel() {
  attempts = 0;
  attemptsDisplay.textContent = 'Attempts: 0';
  message.textContent = 'Level reset.';
  initBottle();
  render();
}

mapSelect.addEventListener('change', (e) => {
  currentMapIndex = parseInt(e.target.value, 10);
  mapDisplay.textContent = 'Map: ' + maps[currentMapIndex].name;
  resetLevel();
});

flipBtn.addEventListener('click', flip);
resetBtn.addEventListener('click', resetLevel);

initBottle();
render();
