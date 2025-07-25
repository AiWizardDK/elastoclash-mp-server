// js/replay.js

let currentReplay = null;
let isRecording = false;
let replayFrames = [];
let replayIndex = 0;

// Start optagelse af replay
export function startRecording() {
  isRecording = true;
  replayFrames = [];
}

// Stop optagelse, returnér alle frames
export function stopRecording() {
  isRecording = false;
  return replayFrames.slice();
}

// Gem en frame – kald dette én gang pr. frame i din main loop, fx med spillers x/y/angle/tid
export function recordFrame(frameData) {
  if (isRecording) {
    if (replayFrames.length === 0) {
      // Gem første frame som normalt
      replayFrames.push(frameData);
    } else {
      // Gem forskellen fra forrige frame
      const lastFrame = replayFrames[replayFrames.length - 1];
      const ddata = {};
      for (const key in frameData) {
        if (typeof frameData[key] === 'number' && typeof lastFrame[key] === 'number') {
          ddata[key] = frameData[key] - lastFrame[key];
        } else {
          ddata[key] = frameData[key];
        }
      }
      replayFrames.push(ddata);
    }
  }
}

// Afspil et replay (array af frames)
export function startReplay(frames) {
  currentReplay = frames;
  replayIndex = 0;
}

// Afspil næste replay-frame, returnér nuværende state
export function getNextReplayFrame() {
  if (!currentReplay || replayIndex >= currentReplay.length) return null;
  const frame = currentReplay[replayIndex];
  replayIndex++;

  if (replayIndex === 1) {
    // Første frame er gemt som normalt
    return frame;
  } else {
    // De efterfølgende frames er gemt som differenser
    const lastFrame = currentReplay[replayIndex - 2]; // Find forrige frame
    const data = {};
    for (const key in frame) {
      if (typeof frame[key] === 'number' && typeof lastFrame[key] === 'number') {
        data[key] = lastFrame[key] + frame[key];
      } else {
        data[key] = frame[key];
      }
    }
    return data;
  }
}

// Spol frem i replay
export function seekReplay(frameIndex) {
    if (!currentReplay) return;
    replayIndex = Math.max(0, Math.min(frameIndex, currentReplay.length - 1));
}

// Er der et replay aktivt?
export function isReplayActive() {
  return currentReplay !== null && replayIndex < currentReplay.length;
}

// Stop replay
export function stopReplay() {
  currentReplay = null;
  replayIndex = 0;
}

// Giv adgang til hele replaysystemets status (fx til ghost-rendering)
export function getCurrentReplay() {
  return currentReplay;
}

// Gem replay til local storage
export function saveReplay(name) {
  localStorage.setItem(name, JSON.stringify(replayFrames));
}

// Indlæs replay fra local storage
export function loadReplay(name) {
  const replayData = localStorage.getItem(name);
  if (replayData) {
    currentReplay = JSON.parse(replayData);
    replayIndex = 0;
  }
}

// Til debugging: export/import som tekst
export function exportReplay(frames) {
  return btoa(JSON.stringify(frames));
}
export function importReplay(str) {
  try {
    return JSON.parse(atob(str));
  } catch (e) {
    alert("Kunne ikke importere replay!");
    return null;
  }
}
