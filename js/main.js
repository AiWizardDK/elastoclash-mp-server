import { Game } from './game.js';

// Main game initialization function
function initGame() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Error: Canvas element with ID "gameCanvas" not found.');
        return null; // Return null if canvas is not found
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Error: Could not get 2D rendering context for canvas.');
        return null;
    }

    return { canvas, ctx }; // Return canvas and context
}

const gameElements = initGame();

if (gameElements) {
    const { canvas, ctx } = gameElements;

    // Initialize the game
    const game = new Game(canvas, ctx);

    // Start the game
    game.start();
}
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
