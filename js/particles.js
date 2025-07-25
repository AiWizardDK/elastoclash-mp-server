// js/particles.js

// Partikel presets
const PARTICLE_TYPES = {
    TRAIL: {
        color: '#00ffff',
        size: 3,
        lifetime: 0.4, // seconds
        alpha: 0.6,
        gravity: 0.05,
        spread: 2
    },
    BOOST: {
        color: '#ff6600',
        size: 8,
        lifetime: 0.5,
        alpha: 0.8,
        gravity: -0.1,
        spread: 4,
        glow: true
    },
    EXPLOSION: {
        colors: ['#ff0000', '#ff6600', '#ffff00'],
        size: 10,
        lifetime: 1.0,
        alpha: 1,
        gravity: 0.2,
        spread: 8,
        decay: 0.98,
        glow: true
    },
    CHECKPOINT: {
        color: '#00ff00',
        size: 6,
        lifetime: 0.8,
        alpha: 0.9,
        gravity: -0.15,
        spread: 3,
        glow: true,
        shape: 'star'
    },
    COLLECT: {
        colors: ['#ffd700', '#ffed4a'],
        size: 5,
        lifetime: 0.6,
        alpha: 0.9,
        gravity: -0.1,
        spread: 5,
        shape: 'circle',
        glow: true,
        spiral: true
    }
};

// General particle constants
const DEFAULT_PARTICLE_SIZE = 6;
const DEFAULT_PARTICLE_LIFETIME = 0.6; // seconds
const DEFAULT_PARTICLE_ALPHA = 1;
const DEFAULT_PARTICLE_GRAVITY = 0.1;
const DEFAULT_PARTICLE_SPREAD = 5;
const DEFAULT_PARTICLE_DECAY = 1;
const DEFAULT_PARTICLE_SPIN_SPEED = 0.2;

const SPIRAL_ANGLE_FACTOR = 0.01;
const SPIRAL_RADIUS_START = 20;
const SPIRAL_RADIUS_DECAY_FACTOR = 0.05;
const SPIRAL_MOVEMENT_FACTOR = 0.1;

const GLOW_ARC_SIZE_MULTIPLIER = 2;
const STAR_POINTS = 5;
const STAR_INNER_RADIUS_MULTIPLIER = 0.5;
const TRIANGLE_SIZE_FACTOR = Math.cos(Math.PI / 6);
const TRIANGLE_Y_OFFSET_FACTOR = Math.sin(Math.PI / 6);

export class ParticleSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
    }

    /**
     * Tilføj en partikel
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {object} options - Partikel indstillinger
     */
    spawnParticle(x, y, options = {}) {
        const preset = options.type ? PARTICLE_TYPES[options.type] : {};
        const {
            color = preset.color || "#fff",
            colors = preset.colors,
            size = preset.size || DEFAULT_PARTICLE_SIZE,
            lifetime = preset.lifetime || DEFAULT_PARTICLE_LIFETIME,
            alpha = preset.alpha || DEFAULT_PARTICLE_ALPHA,
            gravity = preset.gravity || DEFAULT_PARTICLE_GRAVITY,
            spread = preset.spread || DEFAULT_PARTICLE_SPREAD,
            glow = preset.glow || false,
            shape = preset.shape || 'circle',
            spiral = preset.spiral || false,
            decay = preset.decay || DEFAULT_PARTICLE_DECAY,
            vx = (Math.random() - 0.5) * spread,
            vy = (Math.random() - 0.5) * spread
        } = options;

        this.particles.push({
            x, y, vx, vy,
            size,
            color,
            colors,
            lifetime, // in seconds
            alpha,
            gravity,
            glow,
            shape,
            spiral,
            decay,
            rotation: Math.random() * Math.PI * 2,
            spinSpeed: (Math.random() - 0.5) * DEFAULT_PARTICLE_SPIN_SPEED,
            age: 0 // in seconds
        });
    }

    /**
     * Forskellige burst mønstre
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} pattern - Burst mønster (circular, fountain, spiral)
     * @param {object} options - Burst indstillinger
     */
    burst(x, y, pattern = 'circular', options = {}) {
        const count = options.count || 15; // Default burst count
        
        switch(pattern) {
            case 'circular':
                for (let i = 0; i < count; i++) {
                    const angle = (i / count) * Math.PI * 2;
                    const speed = options.speed || 5;
                    this.spawnParticle(x, y, {
                        ...options,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed
                    });
                }
                break;
                
            case 'fountain':
                for (let i = 0; i < count; i++) {
                    const angle = -Math.PI/2 + (Math.random() - 0.5) * Math.PI/4;
                    const speed = (options.speed || 8) + Math.random() * 2;
                    this.spawnParticle(x, y, {
                        ...options,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed
                    });
                }
                break;
                
            case 'spiral':
                for (let i = 0; i < count; i++) {
                    const angle = (i / count) * Math.PI * 8;
                    const radius = (i / count) * (options.speed || 5);
                    this.spawnParticle(x, y, {
                        ...options,
                        vx: Math.cos(angle) * radius,
                        vy: Math.sin(angle) * radius
                    });
                }
                break;
        }
    }

    /**
     * Opdater partikler (kald i din game loop)
     * @param {number} delta - Tid siden sidste opdatering i sekunder
     */
    update(delta) {
        this.particles.forEach(p => {
            p.x += p.vx * delta;
            p.y += p.vy * delta;
            p.vy += p.gravity * delta;
            p.vx *= Math.pow(p.decay, delta); // Apply decay over time
            p.vy *= Math.pow(p.decay, delta);
            p.rotation += p.spinSpeed * delta;
            p.age += delta;
            
            if (p.spiral) {
                const spiralAngle = p.age * SPIRAL_ANGLE_FACTOR * 100; // Scale for visual effect
                const spiralRadius = Math.max(0, SPIRAL_RADIUS_START - p.age * SPIRAL_RADIUS_DECAY_FACTOR * 100); // Scale for visual effect
                p.x += Math.cos(spiralAngle) * spiralRadius * SPIRAL_MOVEMENT_FACTOR * delta;
                p.y += Math.sin(spiralAngle) * spiralRadius * SPIRAL_MOVEMENT_FACTOR * delta;
            }
        });
        // Fjern døde partikler
        this.particles = this.particles.filter(p => p.age < p.lifetime);
    }

    /**
     * Render partikler (kald efter alt andet i dit render loop)
     * @param {CanvasRenderingContext2D} ctx - 2D rendering context
     */
    draw(ctx) {
        this.particles.forEach(p => {
            ctx.save();
            
            // Base alpha med smooth fade-out
            const fadeOut = Math.pow(1 - p.age / p.lifetime, 1.5);
            ctx.globalAlpha = p.alpha * fadeOut;
            
            // Glow effect
            if (p.glow) {
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * GLOW_ARC_SIZE_MULTIPLIER);
                const color = p.colors ? p.colors[Math.floor(p.age * 10) % p.colors.length] : p.color; // Age * 10 for faster color cycle
                gradient.addColorStop(0, color);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * GLOW_ARC_SIZE_MULTIPLIER, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Main particle
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            
            const color = p.colors ? p.colors[Math.floor(p.age * 10) % p.colors.length] : p.color; // Age * 10 for faster color cycle
            ctx.fillStyle = color;
            
            switch(p.shape) {
                case 'star':
                    this.#drawStar(ctx, 0, 0, p.size, STAR_POINTS);
                    break;
                    
                case 'square':
                    ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
                    break;
                    
                case 'triangle':
                    this.#drawTriangle(ctx, 0, 0, p.size);
                    break;
                    
                default: // circle
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                    ctx.fill();
            }
            
            ctx.restore();
        });
    }

    /**
     * Private helper to draw a star shape.
     * @param {CanvasRenderingContext2D} ctx - 2D rendering context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} size - Size of the star
     * @param {number} points - Number of points on the star
     */
    #drawStar(ctx, x, y, size, points = STAR_POINTS) {
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? size : size * STAR_INNER_RADIUS_MULTIPLIER;
            const angle = (i / (points * 2)) * Math.PI * 2;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Private helper to draw a triangle shape.
     * @param {CanvasRenderingContext2D} ctx - 2D rendering context
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} size - Size of the triangle
     */
    #drawTriangle(ctx, x, y, size) {
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size * TRIANGLE_SIZE_FACTOR, y + size * TRIANGLE_Y_OFFSET_FACTOR);
        ctx.lineTo(x - size * TRIANGLE_SIZE_FACTOR, y + size * TRIANGLE_Y_OFFSET_FACTOR);
        ctx.closePath();
        ctx.fill();
    }
}
