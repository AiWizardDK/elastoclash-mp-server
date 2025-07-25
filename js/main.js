import { Game } from './game.js';

// Canvas-opsætning
const canvas = document.getElementById('gameCanvas');
if (!canvas) {
    console.error('Error: Canvas element with ID "gameCanvas" not found.');
    return;
}

const ctx = canvas.getContext('2d');
if (!ctx) {
    console.error('Error: 2D rendering context could not be obtained from canvas.');
    return;
}

// Initialiser spillet
function initGame() {
    // Start nyt spil
    const game = new Game(canvas, ctx);
    game.start();
}

// Start spillet når vinduet er loadet
window.addEventListener('load', initGame);
