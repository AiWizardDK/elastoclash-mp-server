// js/controls.js

/**
 * Kontrol tilstande for spillet
 * @type {Object}
 */
export const controls = {
  left: false,
  right: false,
  up: false,
  down: false,
  action: false,
  boost: false,
  taunt: false,
  menu: false
};

/**
 * Tastatur konfiguration
 * @type {Object}
 */
const DEFAULT_KEYBINDINGS = {
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  action: ['Space'],
  boost: ['ShiftLeft', 'ShiftRight'],
  taunt: ['KeyT'],
  menu: ['Escape']
};

/**
 * Brugerens aktuelle keybindings
 * @type {Object}
 */
let currentKeybindings = {...DEFAULT_KEYBINDINGS};

/**
 * Input buffer for mere præcis input timing
 * @type {Array}
 */
const inputBuffer = [];
const INPUT_BUFFER_SIZE = 10;

/**
 * Gamepad support
 * @type {Object}
 */
let activeGamepad = null;
const GAMEPAD_DEADZONE = 0.2;

// Event listeners til keyboard input
window.addEventListener('keydown', (e) => {
  // Prevent default på spiltaster
  if (Object.values(currentKeybindings).flat().includes(e.code)) {
    e.preventDefault();
  }

  // Opdater input buffer
  addToInputBuffer(e.code, true);

  // Opdater controls baseret på keybindings
  for (const [action, keys] of Object.entries(currentKeybindings)) {
    if (keys.includes(e.code)) {
      controls[action] = true;
      handleSpecialActions(action, true);
    }
  }
      controls.up = true;
      break;
    case 'ArrowDown':
    case 'KeyS':
      controls.down = true;
      break;
    case 'Space':
      controls.action = true;
      break;
  }
});

window.addEventListener('keyup', (e) => {
  // Opdater input buffer
  addToInputBuffer(e.code, false);

  // Opdater controls baseret på keybindings
  for (const [action, keys] of Object.entries(currentKeybindings)) {
    if (keys.includes(e.code)) {
      controls[action] = false;
      handleSpecialActions(action, false);
    }
  }
});

/**
 * Håndterer specielle actions når de aktiveres/deaktiveres
 * @param {string} action - Aktionen der blev triggered
 * @param {boolean} pressed - Om knappen blev trykket ned eller sluppet
 */
function handleSpecialActions(action, pressed) {
  switch (action) {
    case 'taunt':
      if (pressed) {
        // Trigger taunt animation/lyd
        document.dispatchEvent(new CustomEvent('playerTaunt'));
      }
      break;
    case 'menu':
      if (pressed) {
        // Toggle pause menu
        document.dispatchEvent(new CustomEvent('toggleMenu'));
      }
      break;
  }
}

/**
 * Tilføjer input til bufferen
 * @param {string} key - Tasten der blev trykket
 * @param {boolean} pressed - Om tasten blev trykket ned eller sluppet
 */
function addToInputBuffer(key, pressed) {
  const now = performance.now();
  inputBuffer.unshift({ key, pressed, timestamp: now });
  if (inputBuffer.length > INPUT_BUFFER_SIZE) {
    inputBuffer.pop();
  }
}

/**
 * Checker om en bestemt kombination af taster er blevet trykket for nylig
 * @param {Array<string>} combo - Array af taster der udgør kombinationen
 * @param {number} timeWindow - Tidsvindue i ms hvor kombinationen skal være udført
 * @returns {boolean}
 */
export function checkCombo(combo, timeWindow = 500) {
  const now = performance.now();
  let comboIndex = combo.length - 1;
  
  for (const input of inputBuffer) {
    if (now - input.timestamp > timeWindow) break;
    if (input.pressed && input.key === combo[comboIndex]) {
      comboIndex--;
      if (comboIndex < 0) return true;
    }
  }
  return false;
}

/**
 * Opdaterer gamepad input
 */
function updateGamepad() {
  const gamepads = navigator.getGamepads();
  activeGamepad = gamepads[0]; // Brug første tilsluttede gamepad

  if (activeGamepad) {
    // Analog stick til bevægelse
    const horizAxis = activeGamepad.axes[0];
    const vertAxis = activeGamepad.axes[1];

    controls.left = horizAxis < -GAMEPAD_DEADZONE;
    controls.right = horizAxis > GAMEPAD_DEADZONE;
    controls.up = vertAxis < -GAMEPAD_DEADZONE;
    controls.down = vertAxis > GAMEPAD_DEADZONE;

    // Knapper
    controls.action = activeGamepad.buttons[0].pressed; // A knap
    controls.boost = activeGamepad.buttons[1].pressed;  // B knap
    controls.taunt = activeGamepad.buttons[3].pressed;  // Y knap
    controls.menu = activeGamepad.buttons[9].pressed;   // Start knap
  }
}

// Gamepad connection events
window.addEventListener('gamepadconnected', (e) => {
  console.log('Gamepad tilsluttet:', e.gamepad.id);
});

window.addEventListener('gamepaddisconnected', (e) => {
  console.log('Gamepad frakoblet:', e.gamepad.id);
  if (activeGamepad === e.gamepad) {
    activeGamepad = null;
  }
});

/**
 * Gemmer brugerdefinerede keybindings
 * @param {Object} newBindings 
 */
export function saveKeybindings(newBindings) {
  currentKeybindings = {...newBindings};
  localStorage.setItem('keybindings', JSON.stringify(newBindings));
}

/**
 * Indlæser gemte keybindings
 */
export function loadKeybindings() {
  const saved = localStorage.getItem('keybindings');
  if (saved) {
    currentKeybindings = JSON.parse(saved);
  }
}

/**
 * Nulstiller keybindings til standard
 */
export function resetKeybindings() {
  currentKeybindings = {...DEFAULT_KEYBINDINGS};
  localStorage.removeItem('keybindings');
}

// Start gamepad polling
function pollGamepad() {
  updateGamepad();
  requestAnimationFrame(pollGamepad);
}
pollGamepad();

// Indlæs gemte keybindings ved startup
loadKeybindings();
