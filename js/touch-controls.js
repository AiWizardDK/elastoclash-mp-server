// js/touch-controls.js

import { controls } from './controls.js';

let touchUi = null;

export function setupTouchControls() {
  // Vis kun hvis touch-device
  if (!('ontouchstart' in window)) return;

  if (!touchUi) {
    touchUi = document.createElement('div');
    touchUi.id = 'touch-controls';
    touchUi.style = `
      position:fixed;bottom:30px;left:0;width:100vw;height:120px;
      z-index:998;pointer-events:none;user-select:none;
    `;
    document.body.appendChild(touchUi);
  }

  touchUi.innerHTML = `
    <button class="touch-btn" id="touch-left" style="left:10vw;">⏪</button>
    <button class="touch-btn" id="touch-right" style="left:22vw;">⏩</button>
    <button class="touch-btn" id="touch-up" style="right:16vw;">⏫</button>
    <button class="touch-btn" id="touch-action" style="right:4vw;">⏺️</button>
  `;

  document.querySelectorAll('.touch-btn').forEach(btn => {
    btn.style.position = "absolute";
    btn.style.bottom = "0";
    btn.style.width = "64px";
    btn.style.height = "64px";
    btn.style.fontSize = "2em";
    btn.style.borderRadius = "32px";
    btn.style.background = "#222e";
    btn.style.border = "2px solid #0ff";
    btn.style.color = "#0ff";
    btn.style.pointerEvents = "auto";
    btn.style.margin = "8px";
  });

  // Touch events (sætter controls flags)
  const setFlag = (flag, val) => () => { controls[flag] = val; };
  const bind = (id, flag) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('touchstart', setFlag(flag, true));
    el.addEventListener('touchend', setFlag(flag, false));
    el.addEventListener('touchcancel', setFlag(flag, false));
  };

  bind("touch-left", "left");
  bind("touch-right", "right");
  bind("touch-up", "up");
  bind("touch-action", "action");
}

// Kald setupTouchControls() i main.js efter DOM er klar
