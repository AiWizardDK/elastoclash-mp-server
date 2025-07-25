// js/game2.js
import { Bike } from './bike.js';

export class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.bike = null;
        this.gameState = {
            running: false,
            time: 0
        };
        this.lastTime = 0;
    }

    start() {
        this.bike = new Bike(100, 300, 'cyan');
        this.gameState.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    gameLoop(timestamp) {
        const delta = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(delta);
        this.render();

        if (this.gameState.running) {
            requestAnimationFrame((t) => this.gameLoop(t));
        }
    }

    update(delta) {
        if (!this.gameState.running) return;

        this.gameState.time += delta;
        
        if (this.bike) {
            this.bike.update(delta);
            
            if (this.bike.y > this.canvas.height) {
                this.gameState.running = false;
                alert("Game Over!");
            }
        }
    }

    render() {
        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.bike) {
            this.bike.render(this.ctx);
        }
        
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 600, 1280, 20);
    }
}
