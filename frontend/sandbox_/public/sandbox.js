// DOM Elements
const starTypeSelect = document.getElementById('starType');
const initialXInput = document.getElementById('initialX');
const initialYInput = document.getElementById('initialY');
const initialVxInput = document.getElementById('initialVx');
const initialVyInput = document.getElementById('initialVy');
const dtInput = document.getElementById('dt');
const stepsInput = document.getElementById('steps');
const initialXValue = document.getElementById('initialXValue');
const initialYValue = document.getElementById('initialYValue');
const initialVxValue = document.getElementById('initialVxValue');
const initialVyValue = document.getElementById('initialVyValue');
const dtValue = document.getElementById('dtValue');
const stepsValue = document.getElementById('stepsValue');
const runBtn = document.getElementById('runBtn');
const errorDiv = document.getElementById('error');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const frameInfo = document.getElementById('frameInfo');
const coordsInfo = document.getElementById('coordsInfo');
const coordX = document.getElementById('coordX');
const coordY = document.getElementById('coordY');
const starsContainer = document.getElementById('stars');

// State
let presets = [];
let snapshots = [];
let habitableZone = null;
let currentFrame = 0;
let animationId = null;
let isRunning = false;
let defaultDt = null;
let defaultSteps = null;

const STAR_TYPE_LABELS = {
  sun_like: 'Sun',
  red_giant: 'Red Giant',
  white_dwarf: 'White Dwarf'
};

const STAR_COLORS = {
  sun_like: {
    glowInner: 'rgba(255, 215, 0, 0.8)',
    glowMid: 'rgba(255, 165, 0, 0.3)',
    glowOuter: 'rgba(255, 100, 0, 0)',
    coreInner: '#fff',
    coreMid: '#FFD700',
    coreOuter: '#FFA500'
  },
  red_giant: {
    glowInner: 'rgba(255, 99, 71, 0.85)',
    glowMid: 'rgba(220, 38, 38, 0.35)',
    glowOuter: 'rgba(220, 38, 38, 0)',
    coreInner: '#fff5f5',
    coreMid: '#f87171',
    coreOuter: '#dc2626'
  },
  white_dwarf: {
    glowInner: 'rgba(255, 255, 255, 0.9)',
    glowMid: 'rgba(226, 232, 240, 0.35)',
    glowOuter: 'rgba(203, 213, 225, 0)',
    coreInner: '#ffffff',
    coreMid: '#e2e8f0',
    coreOuter: '#cbd5e1'
  }
};

const SLIDER_CONFIGS = {
  sun_like: {
    x: { min: 0.1, max: 2.0, step: 0.1 },
    y: { min: 0.1, max: 2.0, step: 0.1 },
    vx: { min: 0.0, max: 1.0, step: 0.1 },
    vy: { min: 0.0, max: 1.0, step: 0.1 },
    dt: { min: 0.02, max: 0.2, step: 0.02 },
    steps: { min: 1000, max: 10000, step: 1000 }
  },
  red_giant: {
    x: { min: 0.3, max: 3.0, step: 0.1 },
    y: { min: 0.3, max: 3.0, step: 0.1 },
    vx: { min: 0.0, max: 1.1, step: 0.1 },
    vy: { min: 0.0, max: 1.1, step: 0.1 },
    dt: { min: 0.015, max: 0.15, step: 0.015 },
    steps: { min: 1000, max: 10000, step: 1000 }
  },
  white_dwarf: {
    x: { min: 0.1, max: 1.5, step: 0.1 },
    y: { min: 0.1, max: 1.5, step: 0.1 },
    vx: { min: 0.0, max: 0.9, step: 0.1 },
    vy: { min: 0.0, max: 0.9, step: 0.1 },
    dt: { min: 0.025, max: 0.25, step: 0.025 },
    steps: { min: 1000, max: 10000, step: 1000 }
  }
};

// API base URL (adjust if needed)
const API_BASE = 'http://127.0.0.1:8000';

// Generate starfield background
function generateStars() {
  const numStars = 150;
  for (let i = 0; i < numStars; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    const size = Math.random() * 2 + 1;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.setProperty('--opacity', (Math.random() * 0.5 + 0.3).toFixed(2));
    star.style.setProperty('--duration', (Math.random() * 3 + 2) + 's');
    star.style.animationDelay = Math.random() * 3 + 's';
    starsContainer.appendChild(star);
  }
}

// Initialize on page load
async function init() {
  generateStars();
  drawInitialCanvas();
  
  try {
    const response = await fetch(`${API_BASE}/presets`);
    if (!response.ok) {
      throw new Error(`Failed to fetch presets: ${response.status}`);
    }
    presets = await response.json();
    populateStarTypes();
    applyDefaultParameters();
    handleStarTypeChange();
    clearError();
  } catch (err) {
    showError(`Error loading presets: ${err.message}`);
  }
}

function drawInitialCanvas() {
  // Draw empty space with subtle grid
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw subtle grid
  ctx.strokeStyle = 'rgba(102, 126, 234, 0.1)';
  ctx.lineWidth = 1;
  const gridSize = 50;
  
  for (let x = 0; x <= canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  
  for (let y = 0; y <= canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  
  // Draw crosshair at center
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  
  ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  
  ctx.beginPath();
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX, canvas.height);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(canvas.width, centerY);
  ctx.stroke();
  
  ctx.setLineDash([]);
  
  // Draw waiting message
  ctx.fillStyle = 'rgba(102, 126, 234, 0.5)';
  ctx.font = '16px Orbitron, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Configure parameters and launch simulation', centerX, centerY);
}

function populateStarTypes() {
  starTypeSelect.innerHTML = '';
  
  if (Array.isArray(presets)) {
    presets.forEach(preset => {
      const option = document.createElement('option');
      const rawValue = preset.star_type || preset.name || preset;
      option.value = rawValue;
      option.textContent = STAR_TYPE_LABELS[rawValue] || rawValue;
      starTypeSelect.appendChild(option);
    });
  } else if (typeof presets === 'object') {
    const starTypes = presets.star_types || Object.keys(presets.stars || presets);
    starTypes.forEach(key => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = STAR_TYPE_LABELS[key] || key;
      starTypeSelect.appendChild(option);
    });
  }
}

function applyDefaultParameters() {
  if (!presets || typeof presets !== 'object') return;
  const defaults = presets.default_parameters;
  if (!defaults) return;

  if (typeof defaults.dt === 'number') {
    defaultDt = defaults.dt;
    dtInput.value = String(defaults.dt);
  }
  if (typeof defaults.steps === 'number') {
    defaultSteps = defaults.steps;
    stepsInput.value = String(defaults.steps);
  }

  syncSliderDisplays();
}

function showError(message) {
  errorDiv.textContent = message;
  errorDiv.classList.add('visible');
}

function clearError() {
  errorDiv.textContent = '';
  errorDiv.classList.remove('visible');
}

function setRunning(running) {
  isRunning = running;
  runBtn.disabled = running;
  
  const btnText = runBtn.querySelector('.btn-text');
  if (running) {
    runBtn.classList.add('running');
    btnText.innerHTML = '<span class="spinner"></span>Simulating...';
  } else {
    runBtn.classList.remove('running');
    btnText.textContent = 'Launch Simulation';
  }
}

function formatValue(value, decimals = 1) {
  return Number(value).toFixed(decimals);
}

function syncSliderDisplays() {
  initialXValue.textContent = formatValue(initialXInput.value, 1);
  initialYValue.textContent = formatValue(initialYInput.value, 1);
  initialVxValue.textContent = formatValue(initialVxInput.value, 1);
  initialVyValue.textContent = formatValue(initialVyInput.value, 1);
  dtValue.textContent = formatValue(dtInput.value, 2);
  stepsValue.textContent = String(parseInt(stepsInput.value, 10));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function applyConfigBounds(config) {
  // Bounds are tuned per star type to keep simulations stable.
  initialXInput.min = String(config.x.min);
  initialXInput.max = String(config.x.max);
  initialXInput.step = String(config.x.step);

  initialYInput.min = String(config.y.min);
  initialYInput.max = String(config.y.max);
  initialYInput.step = String(config.y.step);

  initialVxInput.min = String(config.vx.min);
  initialVxInput.max = String(config.vx.max);
  initialVxInput.step = String(config.vx.step);

  initialVyInput.min = String(config.vy.min);
  initialVyInput.max = String(config.vy.max);
  initialVyInput.step = String(config.vy.step);

  dtInput.min = String(config.dt.min);
  dtInput.max = String(config.dt.max);
  dtInput.step = String(config.dt.step);

  stepsInput.min = String(config.steps.min);
  stepsInput.max = String(config.steps.max);
  stepsInput.step = String(config.steps.step);
}

function applyConfigDefaults(config) {
  const xDefault = clamp(1.0, config.x.min, config.x.max);
  const yDefault = clamp(0.1, config.y.min, config.y.max);
  const vxDefault = clamp(0.0, config.vx.min, config.vx.max);
  const vyDefault = clamp(1.0, config.vy.min, config.vy.max);
  const dtDefault = clamp(
    typeof defaultDt === 'number' ? defaultDt : config.dt.min,
    config.dt.min,
    config.dt.max
  );
  const stepsDefault = clamp(
    typeof defaultSteps === 'number' ? defaultSteps : config.steps.min,
    config.steps.min,
    config.steps.max
  );

  initialXInput.value = String(xDefault);
  initialYInput.value = String(yDefault);
  initialVxInput.value = String(vxDefault);
  initialVyInput.value = String(vyDefault);
  dtInput.value = String(dtDefault);
  stepsInput.value = String(Math.round(stepsDefault));

  syncSliderDisplays();
}

function handleStarTypeChange() {
  const config = SLIDER_CONFIGS[starTypeSelect.value];
  if (!config) {
    syncSliderDisplays();
    return;
  }

  applyConfigBounds(config);
  applyConfigDefaults(config);
}

async function runSimulation() {
  if (isRunning) return;
  
  // Stop any existing animation
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  
  setRunning(true);
  clearError();
  
  const payload = {
    star_type: starTypeSelect.value,
    x: parseFloat(initialXInput.value),
    y: parseFloat(initialYInput.value),
    vx: parseFloat(initialVxInput.value),
    vy: parseFloat(initialVyInput.value),
    dt: parseFloat(dtInput.value),
    steps: parseInt(stepsInput.value, 10)
  };
  
  try {
    const response = await fetch(`${API_BASE}/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Simulation failed: ${response.status}`);
    }
    
    const data = await response.json();

    // /simulate returns an array of snapshots
    if (Array.isArray(data)) {
      snapshots = data;
    } else {
      snapshots = data.snapshots || [];
    }

    habitableZone = snapshots[0]?.habitable_zone || null;

    if (snapshots[0]) {
      console.log('star', snapshots[0].star);
      console.log('habitable_zone', snapshots[0].habitable_zone);
      console.log('particle', snapshots[0].particles?.[0]);
    }
    
    if (snapshots.length > 0) {
      currentFrame = 0;
      frameInfo.classList.add('visible');
      coordsInfo.classList.add('visible');
      animate();
    } else {
      showError('No simulation data received');
      setRunning(false);
    }
  } catch (err) {
    showError(`Error: ${err.message}`);
    setRunning(false);
  }
}

function calculateScale() {
  // Find bounds of all positions
  let maxDist = 1;
  
  snapshots.forEach(snapshot => {
    const particle = snapshot.particles?.[0];
    const x = particle?.x ?? 0;
    const y = particle?.y ?? 0;
    const dist = Math.sqrt(x * x + y * y);
    if (dist > maxDist) maxDist = dist;
  });
  
  // Include habitable zone in bounds
  if (habitableZone && habitableZone.r_outer) {
    maxDist = Math.max(maxDist, habitableZone.r_outer);
  }
  
  // Add padding
  const padding = 60;
  const availableSize = Math.min(canvas.width, canvas.height) - padding * 2;
  return availableSize / (maxDist * 2);
}

function toCanvasCoords(x, y, scale) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  return {
    x: centerX + x * scale,
    y: centerY - y * scale  // Flip Y for canvas coordinates
  };
}

function drawFrame(frameIndex) {
  const scale = calculateScale();
  
  // Clear canvas with dark background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw subtle grid
  ctx.strokeStyle = 'rgba(102, 126, 234, 0.05)';
  ctx.lineWidth = 1;
  const gridSize = 50;
  
  for (let x = 0; x <= canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  
  for (let y = 0; y <= canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  
  // Draw habitable zone with glow effect
  if (habitableZone) {
    const center = toCanvasCoords(0, 0, scale);
    
    // Outer circle with glow
    if (habitableZone.r_outer) {
      const outerRadius = habitableZone.r_outer * scale;
      
      // Glow effect
      const gradient = ctx.createRadialGradient(
        center.x, center.y, outerRadius - 20,
        center.x, center.y, outerRadius + 20
      );
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0)');
      gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.1)');
      gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(center.x, center.y, outerRadius + 20, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.arc(center.x, center.y, outerRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Inner circle
    if (habitableZone.r_inner) {
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.arc(center.x, center.y, habitableZone.r_inner * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Fill habitable zone
    if (habitableZone.r_inner && habitableZone.r_outer) {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.05)';
      ctx.beginPath();
      ctx.arc(center.x, center.y, habitableZone.r_outer * scale, 0, Math.PI * 2);
      ctx.arc(center.x, center.y, habitableZone.r_inner * scale, 0, Math.PI * 2, true);
      ctx.fill();
    }
  }
  
  // Draw orbit trail with gradient
  if (frameIndex > 0) {
    for (let i = 1; i <= frameIndex && i < snapshots.length; i++) {
      const prevSnapshot = snapshots[i - 1];
      const snapshot = snapshots[i];
      
      const prevParticle = prevSnapshot.particles?.[0];
      const particle = snapshot.particles?.[0];
      const prevX = prevParticle?.x ?? 0;
      const prevY = prevParticle?.y ?? 0;
      const x = particle?.x ?? 0;
      const y = particle?.y ?? 0;
      
      const prevPos = toCanvasCoords(prevX, prevY, scale);
      const pos = toCanvasCoords(x, y, scale);
      
      // Fade trail based on age
      const alpha = 0.3 + (i / frameIndex) * 0.5;
      ctx.strokeStyle = `rgba(102, 126, 234, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(prevPos.x, prevPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  }
  
  // Draw star at origin with glow
  const starPos = toCanvasCoords(0, 0, scale);
  const starStyle = STAR_COLORS[starTypeSelect.value] || STAR_COLORS.sun_like;
  
  // Star glow
  const starGlow = ctx.createRadialGradient(
    starPos.x, starPos.y, 0,
    starPos.x, starPos.y, 40
  );
  starGlow.addColorStop(0, starStyle.glowInner);
  starGlow.addColorStop(0.3, starStyle.glowMid);
  starGlow.addColorStop(1, starStyle.glowOuter);
  
  ctx.fillStyle = starGlow;
  ctx.beginPath();
  ctx.arc(starPos.x, starPos.y, 40, 0, Math.PI * 2);
  ctx.fill();
  
  // Star core
  const starCore = ctx.createRadialGradient(
    starPos.x, starPos.y, 0,
    starPos.x, starPos.y, 12
  );
  starCore.addColorStop(0, starStyle.coreInner);
  starCore.addColorStop(0.5, starStyle.coreMid);
  starCore.addColorStop(1, starStyle.coreOuter);
  
  ctx.fillStyle = starCore;
  ctx.beginPath();
  ctx.arc(starPos.x, starPos.y, 12, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw current planet position
  if (frameIndex < snapshots.length) {
    const snapshot = snapshots[frameIndex];
    const particle = snapshot.particles?.[0];
    const x = particle?.x ?? 0;
    const y = particle?.y ?? 0;
    const planetPos = toCanvasCoords(x, y, scale);
    
    // Planet glow
    const planetGlow = ctx.createRadialGradient(
      planetPos.x, planetPos.y, 0,
      planetPos.x, planetPos.y, 20
    );
    planetGlow.addColorStop(0, 'rgba(102, 126, 234, 0.6)');
    planetGlow.addColorStop(1, 'rgba(102, 126, 234, 0)');
    
    ctx.fillStyle = planetGlow;
    ctx.beginPath();
    ctx.arc(planetPos.x, planetPos.y, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Planet core
    const planetCore = ctx.createRadialGradient(
      planetPos.x, planetPos.y, 0,
      planetPos.x, planetPos.y, 8
    );
    planetCore.addColorStop(0, '#a5b4fc');
    planetCore.addColorStop(0.7, '#667eea');
    planetCore.addColorStop(1, '#4c51bf');
    
    ctx.fillStyle = planetCore;
    ctx.beginPath();
    ctx.arc(planetPos.x, planetPos.y, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Update coordinate display
    coordX.textContent = x.toFixed(3);
    coordY.textContent = y.toFixed(3);
  }
  
  // Update frame info
  frameInfo.textContent = `Frame: ${frameIndex + 1} / ${snapshots.length}`;
}

function animate() {
  drawFrame(currentFrame);
  
  currentFrame++;
  
  if (currentFrame < snapshots.length) {
    animationId = requestAnimationFrame(animate);
  } else {
    // Animation complete
    setRunning(false);
    animationId = null;
  }
}

// Event listeners
runBtn.addEventListener('click', runSimulation);
starTypeSelect.addEventListener('change', handleStarTypeChange);
initialXInput.addEventListener('input', syncSliderDisplays);
initialYInput.addEventListener('input', syncSliderDisplays);
initialVxInput.addEventListener('input', syncSliderDisplays);
initialVyInput.addEventListener('input', syncSliderDisplays);
dtInput.addEventListener('input', syncSliderDisplays);
stepsInput.addEventListener('input', syncSliderDisplays);

// Initialize
init();
