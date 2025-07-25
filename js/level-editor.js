// js/level-editor.js

let editorActive = false;
let points = [];
let onSaveCallback = null;

// Start editor
export function openLevelEditor(startPoints = [], onSave = null) {
  editorActive = true;
  points = startPoints.slice();
  onSaveCallback = onSave;
  renderEditorUI();
}

// Luk editor
export function closeLevelEditor() {
  editorActive = false;
  document.getElementById("level-editor-ui")?.remove();
}

// Gem level (returner som array eller string)
function saveLevel() {
  if (onSaveCallback) onSaveCallback(points.slice());
  closeLevelEditor();
}

// Render editorens UI
function renderEditorUI() {
  let ui = document.getElementById("level-editor-ui");
  if (!ui) {
    ui = document.createElement("div");
    ui.id = "level-editor-ui";
    ui.classList.add("level-editor-ui");
    document.body.appendChild(ui);
  }
  ui.innerHTML = `
    <div class="level-editor-panel">
      <h2>🛠️ Level Editor</h2>
      <button id="level-add-point">Tilføj punkt</button>
      <button id="level-remove-point">Fjern sidste punkt</button>
      <button id="level-save">Gem & brug bane</button>
      <button id="level-cancel">Fortryd</button>
      <div class="level-editor-points">Points:<br>${points.map((p,i)=>`<span class="level-editor-point-number">${i+1}</span>: (${p.x}, ${p.y})`).join("<br>")}</div>
    </div>
  `;

  document.getElementById("level-add-point").onclick = () => {
    showCoordinateInputDialog((x, y) => {
      points.push({ x, y });
      renderEditorUI();
    });
  };
  document.getElementById("level-remove-point").onclick = () => {
    points.pop();
    renderEditorUI();
  };
  document.getElementById("level-save").onclick = saveLevel;
  document.getElementById("level-cancel").onclick = closeLevelEditor;
}

/**
 * Shows a custom dialog for entering X and Y coordinates.
 * @param {(x: number, y: number) => void} onConfirm - Callback function when coordinates are confirmed.
 */
function showCoordinateInputDialog(onConfirm) {
  let dialogOverlay = document.getElementById("coordinate-input-dialog");
  if (!dialogOverlay) {
    dialogOverlay = document.createElement("div");
    dialogOverlay.id = "coordinate-input-dialog";
    dialogOverlay.classList.add("input-dialog-overlay");
    document.body.appendChild(dialogOverlay);
  }

  dialogOverlay.innerHTML = `
    <div class="input-dialog-content">
      <h3>Indtast koordinater</h3>
      <input type="number" id="coord-x" placeholder="X-koordinat (0-1280)" value="200">
      <input type="number" id="coord-y" placeholder="Y-koordinat (0-720)" value="400">
      <p class="error-message" id="coord-error-message"></p>
      <div>
        <button id="coord-ok">OK</button>
        <button id="coord-cancel">Annuller</button>
      </div>
    </div>
  `;

  dialogOverlay.style.display = "flex"; // Show the dialog

  const xInput = document.getElementById("coord-x");
  const yInput = document.getElementById("coord-y");
  const errorMessage = document.getElementById("coord-error-message");

  document.getElementById("coord-ok").onclick = () => {
    const x = parseInt(xInput.value);
    const y = parseInt(yInput.value);

    if (isNaN(x) || isNaN(y)) {
      errorMessage.textContent = "Indtast venligst gyldige tal for X og Y.";
      return;
    }
    if (x < 0 || x > 1280 || y < 0 || y > 720) {
      errorMessage.textContent = "Koordinater skal være inden for (0-1280) og (0-720).";
      return;
    }

    onConfirm(x, y);
    dialogOverlay.style.display = "none"; // Hide the dialog
  };

  document.getElementById("coord-cancel").onclick = () => {
    dialogOverlay.style.display = "none"; // Hide the dialog
  };
}

// Kan kaldes fra fx pause-menuen eller main.js
export function isEditorActive() {
  return editorActive;
}

// Til preview i canvas:
export function drawLevelEditor(ctx) {
  if (!editorActive) return;
  ctx.save();
  ctx.strokeStyle = "#0ff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  if (points.length > 0) {
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
  }
  ctx.stroke();
  ctx.restore();
}
