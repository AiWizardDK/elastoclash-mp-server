// powerups.js - Kraftfulde power-ups til søfarende!

import powerUpConfig from './powerup-config.js';

export class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.collected = false;
        this.animationOffset = Math.random() * Math.PI * 2;
        this.size = 20;
    }

    getEffect() {
        const config = powerUpConfig[this.type];
        if (!config) return null;

        return {
            duration: config.duration,
            effect: config.effect,
            restore: config.restore
        };
    }

    draw(ctx) {
        if (this.collected) return;

        const bounce = this.getBounceEffect();
        
        ctx.save();
        ctx.translate(this.x, this.y + bounce);

        this.drawGlowEffect(ctx);
        this.drawIcon(ctx);
        
        ctx.restore();
    }

    getBounceEffect() {
        return Math.sin(Date.now() / 500 + this.animationOffset) * 5;
    }

    drawGlowEffect(ctx) {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, this.getColor(0.3));
        gradient.addColorStop(1, this.getColor(0));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    drawIcon(ctx) {
        ctx.fillStyle = this.getColor(1);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        
        const config = powerUpConfig[this.type];
        if (config) {
            config.drawIcon(ctx);
        }
    }

    getColor(alpha = 1) {
        const config = powerUpConfig[this.type];
        if (!config) return `rgba(255, 255, 255, ${alpha})`;
        return config.color.replace('\${alpha}', alpha);
    }
}
