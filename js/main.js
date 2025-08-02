import { Game } from './game.js';

// Main game initialization function
function initGame() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Error: Canvas element with ID "gameCanvas" not found.');
        return null;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Error: Could not get 2D rendering context for canvas.');
        return null;
    }

    return { canvas, ctx };
}

const gameElements = initGame();

if (gameElements) {
    const { canvas, ctx } = gameElements;
    const game = new Game(canvas, ctx);
    game.start();
}