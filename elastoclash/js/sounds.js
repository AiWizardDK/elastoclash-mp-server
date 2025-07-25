// js/sounds.js

import { soundEngine } from './sound-engine.js';
import { soundConfig } from './sound-config.js';

const sounds = {};

export async function initSounds() {
    // Vi loader lydene asynkront
    try {
        // sounds.drive = new Audio('assets/drive.mp3');
        // sounds.crash = new Audio('assets/crash.mp3');
        // sounds.win = new Audio('assets/win.mp3');
        // await soundEngine.loadSound('drive', 'assets/drive.mp3');
        // await soundEngine.loadSound('crash', 'assets/crash.mp3');
        // await soundEngine.loadSound('win', 'assets/win.mp3');
        for (const name in soundConfig) {
            await soundEngine.loadSound(name, soundConfig[name].url);
        }
        return true;
    } catch (error) {
        console.warn('Kunne ikke indlæse lyde:', error);
        return false;
    }
}

export function playSound(name, volume = 1.0) {
    // if (sounds[name]) {
    //     const sound = sounds[name].cloneNode();
    //     sound.volume = volume;
    //     sound.play().catch(e => console.warn('Kunne ikke afspille lyd:', e));
    // }
    soundEngine.play(name, { volume });
}

// Eksempel: Kør denne når spillet loader for at sikre at lyde kan afspilles på mobil
export function unlockAudioOnMobile() {
  window.addEventListener('touchstart', () => {
    Object.values(sounds).forEach(snd => {
      try { snd.play().then(() => snd.pause()); } catch (e) {}
    });
  }, { once: true });
}
