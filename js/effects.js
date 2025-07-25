// effects.js - Advanced Visual og lydeffekter system

import { burst } from './particles.js';
import { soundEngine } from './sound-engine.js';

const PARTICLE_PATTERNS = {
    SPIRAL: 'spiral',
    BURST: 'burst',
    FOUNTAIN: 'fountain',
    VORTEX: 'vortex',      // Ny! Roterende spiral der trækker indad
    RAIN: 'rain',          // Ny! Falder ned med gravity
    TRAIL: 'trail',        // Ny! Følger et objekt
    SHOCKWAVE: 'shockwave', // Ny! Ekspanderende ring
    IMPLODE: 'implode',    // Ny! Suger ind mod centrum
    HELIX: 'helix',        // Ny! Double spiral effekt
    FIREWORK: 'firework',  // Ny! Eksplosion med sub-eksplosioner
    MATRIX: 'matrix',      // Ny! Digital regn effekt
    CONFETTI: 'confetti'   // Ny! Festlige papirstykker
};

const EFFECT_TYPES = {
    COLLECT: {
        particles: {
            type: 'COLLECT',
            patterns: [PARTICLE_PATTERNS.SPIRAL, PARTICLE_PATTERNS.BURST, PARTICLE_PATTERNS.FOUNTAIN],
            colors: ['#FFD700', '#FFA500', '#FFFFFF'],
            sizes: [2, 4],
            lifetime: [0.5, 1.0],
            blend: 'add'  // Ny! Blending mode
        },
        sound: {
            name: 'collect',
            volume: 0.8,
            pitch: [0.9, 1.1]
        },
        screenShake: {
            intensity: 5,
            duration: 200
        }
    },
    
    // Nye effekt typer!
    SPEED_LINES: {
        particles: {
            type: 'SPEED',
            patterns: [PARTICLE_PATTERNS.MATRIX, PARTICLE_PATTERNS.TRAIL],
            colors: ['#00FF00', '#0000FF', '#4169E1'],
            sizes: [1, 3],
            lifetime: [0.2, 0.4],
            blend: 'screen'
        },
        screenShake: {
            intensity: 2,
            duration: 100,
            pattern: 'pulse'
        }
    },
    
    ENERGY_FIELD: {
        particles: {
            type: 'ENERGY',
            patterns: [PARTICLE_PATTERNS.VORTEX, PARTICLE_PATTERNS.HELIX],
            colors: ['#4169E1', '#00FFFF', '#FF69B4'],
            sizes: [2, 4],
            lifetime: [1.0, 2.0],
            blend: 'screen',
            glow: true  // Ny! Glow effekt
        },
        screenShake: {
            intensity: 3,
            duration: 300,
            pattern: 'cascade'
        }
    },
    
    SHOCKWAVE_BURST: {
        particles: {
            type: 'SHOCKWAVE',
            patterns: [PARTICLE_PATTERNS.SHOCKWAVE, PARTICLE_PATTERNS.IMPLODE],
            colors: ['#FFFFFF', '#FF4500', '#FFD700'],
            sizes: [4, 8],
            lifetime: [0.3, 0.6],
            blend: 'overlay'
        },
        screenShake: {
            intensity: 12,
            duration: 400,
            pattern: 'decay'
        }
    },
    BOOST: {
        particles: {
            type: 'BOOST',
            patterns: ['fountain', 'trail'],
            colors: ['#FF4500', '#FF8C00', '#FFD700'],
            sizes: [3, 5],
            lifetime: [0.3, 0.8]
        },
        sound: {
            name: 'boost',
            volume: 0.9,
            pitch: [1.0, 1.2]
        },
        screenShake: {
            intensity: 8,
            duration: 300
        }
    },
    COLLISION: {
        particles: {
            type: 'EXPLOSION',
            patterns: ['circular', 'burst'],
            colors: ['#FF0000', '#FF4500', '#FFA500'],
            sizes: [3, 6],
            lifetime: [0.5, 1.2]
        },
        sound: {
            name: 'collision',
            volume: 1.0,
            pitch: [0.8, 1.0]
        },
        screenShake: {
            intensity: 15,
            duration: 400
        }
    },
    CHECKPOINT: {
        particles: {
            type: 'CHECKPOINT',
            patterns: ['circular', 'spiral'],
            colors: ['#00FF00', '#32CD32', '#FFFFFF'],
            sizes: [2, 4],
            lifetime: [0.8, 1.5]
        },
        sound: {
            name: 'checkpoint',
            volume: 0.8,
            pitch: [1.0, 1.1]
        },
        screenShake: {
            intensity: 6,
            duration: 250
        }
    },
    VICTORY: {
        particles: {
            type: 'VICTORY',
            patterns: ['firework', 'spiral', 'fountain'],
            colors: ['#FFD700', '#FF69B4', '#4169E1', '#32CD32'],
            sizes: [3, 6],
            lifetime: [1.0, 2.0]
        },
        sound: {
            name: 'victory',
            volume: 1.0,
            pitch: [1.0, 1.0]
        },
        screenShake: {
            intensity: 10,
            duration: 1000,
            pattern: 'cascade'
        }
    }
};

export class EffectSystem {
    constructor(game) {
        this.game = game;
        this.activeEffects = [];
        this.screenShake = {
            intensity: 0,
            duration: 0,
            startTime: 0,
            pattern: 'normal'
        };
        this.timeScale = 1.0;
        this.effectQueue = [];
        
        // Performance optimering
        this.maxParticles = 1000;  // Maximum antal partikler på samme tid
        this.currentParticles = 0;
        
        // Object pools for bedre performance
        this.particlePool = [];
        this.effectPool = [];
        
        // Pre-allocate pools
        this.initializePools();
        
        // Frame timing og throttling
        this.lastFrameTime = performance.now();
        this.frameBudget = 16; // ~60 FPS
        
        // Spatial partitioning for particle kollisioner
        this.grid = {
            cellSize: 50,
            cells: new Map()
        };
        
        // Batching af particle rendering
        this.renderBatches = new Map();
        
        // GPU acceleration når muligt
        this.useGPU = this.checkGPUSupport();
    }

    update(delta) {
        // Opdater tidsskala
        const scaledDelta = delta * this.timeScale;

        // Behandl effect queue
        while (this.effectQueue.length > 0 && this.activeEffects.length < 10) {
            const effect = this.effectQueue.shift();
            this.activeEffects.push(effect);
        }

        // Opdater aktive effekter
        for (let i = this.activeEffects.length - 1; i >= 0; i--) {
            const effect = this.activeEffects[i];
            effect.update(scaledDelta);
            if (effect.isComplete) {
                this.activeEffects.splice(i, 1);
            }
        }

        // Opdater screen shake med forskellige mønstre
        if (this.screenShake.duration > 0) {
            const progress = (Date.now() - this.screenShake.startTime) / this.screenShake.duration;
            if (progress >= 1) {
                this.screenShake.duration = 0;
            } else {
                const intensity = this.calculateShakeIntensity(progress);
                const offset = this.calculateShakeOffset(intensity);
                this.game.camera.x += offset.x;
                this.game.camera.y += offset.y;
            }
        }
    }

    calculateShakeIntensity(progress) {
        switch (this.screenShake.pattern) {
            case 'cascade':
                // Bølgende intensitet
                return this.screenShake.intensity * (1 - progress) * (1 + Math.sin(progress * Math.PI * 4));
            case 'pulse':
                // Pulserende intensitet
                return this.screenShake.intensity * (1 - progress) * (0.5 + Math.pow(Math.sin(progress * Math.PI * 6), 2));
            case 'decay':
                // Eksponentielt aftagende
                return this.screenShake.intensity * Math.pow(1 - progress, 2);
            default:
                // Normal lineær aftagen
                return this.screenShake.intensity * (1 - progress);
        }
    }

    calculateShakeOffset(intensity) {
        const angle = Math.random() * Math.PI * 2;
        return {
            x: Math.cos(angle) * intensity * (0.8 + Math.random() * 0.4),
            y: Math.sin(angle) * intensity * (0.8 + Math.random() * 0.4)
        };
    }

    addScreenShake(intensity = 10, duration = 500, pattern = 'normal') {
        // Hvis der allerede er en kraftigere shake aktiv, behold den
        if (this.screenShake.duration > 0 && this.screenShake.intensity > intensity) {
            return;
        }

        this.screenShake = {
            intensity,
            duration,
            startTime: Date.now(),
            pattern
        };
    }

    setTimeScale(scale) {
        this.timeScale = Math.max(0.1, Math.min(2.0, scale));
    }

    createEffect(type, x, y, options = {}) {
        const effectConfig = EFFECT_TYPES[type];
        if (!effectConfig) return;

        // Basis konfiguration
        const config = {
            position: { x, y },
            startTime: Date.now(),
            type,
            ...options
        };

        // Tilfældige variationer indenfor effektens parametre
        const particles = effectConfig.particles;
        config.particleConfig = {
            pattern: particles.patterns[Math.floor(Math.random() * particles.patterns.length)],
            color: particles.colors[Math.floor(Math.random() * particles.colors.length)],
            size: particles.sizes[0] + Math.random() * (particles.sizes[1] - particles.sizes[0]),
            lifetime: particles.lifetime[0] + Math.random() * (particles.lifetime[1] - particles.lifetime[0])
        };

        // Lyd konfiguration med pitch variation
        const sound = effectConfig.sound;
        config.soundConfig = {
            name: sound.name,
            volume: sound.volume * (options.volumeScale || 1),
            pitch: sound.pitch[0] + Math.random() * (sound.pitch[1] - sound.pitch[0])
        };

        return config;
    }

    playEffect(type, x, y, options = {}) {
        const effect = this.createEffect(type, x, y, options);
        if (!effect) return;

        // Afspil lyd med variation
        soundEngine.play(effect.soundConfig.name, {
            volume: effect.soundConfig.volume,
            pitch: effect.soundConfig.pitch
        });

        // Generer partikler
        const particleCount = options.particleCount || 15;
        burst(x, y, effect.particleConfig.pattern, {
            type: effect.type,
            count: particleCount,
            speed: options.speed || 3,
            size: effect.particleConfig.size,
            color: effect.particleConfig.color,
            lifetime: effect.particleConfig.lifetime
        });

        // Tilføj screen shake hvis konfigureret
        const shakeConfig = EFFECT_TYPES[type].screenShake;
        if (shakeConfig) {
            const intensity = shakeConfig.intensity * (options.intensityScale || 1);
            this.addScreenShake(
                intensity,
                shakeConfig.duration,
                options.shakePattern || 'normal'
            );
        }
    }

    playCollectEffect(x, y, value = 1) {
        this.playEffect('COLLECT', x, y, {
            particleCount: 10 + Math.floor(value * 5),
            intensityScale: 0.8 + value * 0.2
        });
    }

    playBoostEffect(x, y, speed) {
        this.playEffect('BOOST', x, y, {
            particleCount: 15 + Math.floor(speed * 2),
            speed: 4 + speed * 0.5,
            intensityScale: Math.min(2, 0.5 + speed * 0.1)
        });
    }

    playCollisionEffect(x, y, velocity) {
        const intensityScale = Math.min(2, velocity / 10);
        this.playEffect('COLLISION', x, y, {
            particleCount: Math.floor(20 * intensityScale),
            speed: Math.min(12, velocity),
            intensityScale,
            shakePattern: velocity > 15 ? 'cascade' : 'decay'
        });
    }

    playCheckpointEffect(x, y, isLastCheckpoint = false) {
        this.playEffect('CHECKPOINT', x, y, {
            particleCount: isLastCheckpoint ? 30 : 20,
            intensityScale: isLastCheckpoint ? 1.5 : 1,
            shakePattern: isLastCheckpoint ? 'pulse' : 'normal'
        });
    }

    playLevelCompleteEffect(score = 0, time = 0) {
        const centerX = this.game.camera.x + this.game.canvas.width / 2;
        const centerY = this.game.camera.y + this.game.canvas.height / 2;
        
        // Sæt tidsskala til slow motion
        this.setTimeScale(0.5);
        
        // Hovedfyrværkeri sekvens
        this.playEffect('VICTORY', centerX, centerY, {
            particleCount: 50,
            intensityScale: 1.5,
            shakePattern: 'cascade'
        });

        // Serie af koordinerede effekter
        const effects = [
            // Spiral effekt fra midten
            { delay: 200, fn: () => {
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const distance = 100;
                    this.playEffect('COLLECT', 
                        centerX + Math.cos(angle) * distance,
                        centerY + Math.sin(angle) * distance,
                        { particleCount: 15, shakePattern: 'pulse' }
                    );
                }
            }},
            // Fountain effekter i siderne
            { delay: 500, fn: () => {
                this.playEffect('BOOST', centerX - 150, centerY, 
                    { particleCount: 25, shakePattern: 'normal' });
                this.playEffect('BOOST', centerX + 150, centerY, 
                    { particleCount: 25, shakePattern: 'normal' });
            }},
            // Eksplosion af checkpoint partikler
            { delay: 800, fn: () => {
                for (let i = 0; i < 4; i++) {
                    const angle = (i / 4) * Math.PI * 2;
                    const distance = 120;
                    this.playEffect('CHECKPOINT',
                        centerX + Math.cos(angle) * distance,
                        centerY + Math.sin(angle) * distance,
                        { particleCount: 20, shakePattern: 'decay' }
                    );
                }
            }},
            // Final celebration burst
            { delay: 1200, fn: () => {
                this.playEffect('VICTORY', centerX, centerY - 50, {
                    particleCount: 40,
                    intensityScale: 1.2,
                    shakePattern: 'cascade'
                });
            }}
        ];

        // Afspil alle effekter med korrekt timing
        effects.forEach(effect => {
            setTimeout(effect.fn, effect.delay);
        });

        // Gradvist returner til normal tidsskala
        setTimeout(() => {
            this.setTimeScale(0.7);
        }, 1000);
        
        setTimeout(() => {
            this.setTimeScale(0.85);
        }, 1500);
        
        setTimeout(() => {
            this.setTimeScale(1.0);
        }, 2000);

        // Tilføj ekstra effekter baseret på score/tid
        if (score > 1000 || time < 30) {
            setTimeout(() => {
                // Bonus celebration for exceptional performance
                const positions = [
                    { x: -200, y: -100 },
                    { x: 200, y: -100 },
                    { x: 0, y: -150 }
                ];
                
                positions.forEach((pos, i) => {
                    setTimeout(() => {
                        this.playEffect('VICTORY',
                            centerX + pos.x,
                            centerY + pos.y,
                            {
                                particleCount: 30,
                                intensityScale: 1.0,
                                shakePattern: 'pulse'
                            }
                        );
                    }, i * 200);
                });
            }, 1500);
        }
    }
    
    // Performance optimerede hjælpefunktioner
    initializePools() {
        // Pre-allocate particle pool
        for (let i = 0; i < this.maxParticles; i++) {
            this.particlePool.push(this.createPooledParticle());
        }
        
        // Pre-allocate effect pool
        for (let i = 0; i < 50; i++) {
            this.effectPool.push(this.createPooledEffect());
        }
    }
    
    createPooledParticle() {
        return {
            active: false,
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            size: 0,
            color: '',
            lifetime: 0,
            maxLifetime: 0,
            type: '',
            reset: function() {
                this.active = false;
                this.x = 0;
                this.y = 0;
                this.vx = 0;
                this.vy = 0;
            }
        };
    }
    
    createPooledEffect() {
        return {
            active: false,
            type: '',
            particles: [],
            config: null,
            reset: function() {
                this.active = false;
                this.particles.length = 0;
                this.config = null;
            }
        };
    }
    
    getParticleFromPool() {
        for (let particle of this.particlePool) {
            if (!particle.active) {
                particle.active = true;
                return particle;
            }
        }
        return null; // Pool er tom
    }
    
    getEffectFromPool() {
        for (let effect of this.effectPool) {
            if (!effect.active) {
                effect.active = true;
                return effect;
            }
        }
        return null; // Pool er tom
    }
    
    updateGrid() {
        this.grid.cells.clear();
        
        for (const effect of this.activeEffects) {
            for (const particle of effect.particles) {
                const cellX = Math.floor(particle.x / this.grid.cellSize);
                const cellY = Math.floor(particle.y / this.grid.cellSize);
                const cellKey = `${cellX},${cellY}`;
                
                if (!this.grid.cells.has(cellKey)) {
                    this.grid.cells.set(cellKey, []);
                }
                this.grid.cells.get(cellKey).push(particle);
            }
        }
    }
    
    optimizeRendering() {
        this.renderBatches.clear();
        
        for (const effect of this.activeEffects) {
            for (const particle of effect.particles) {
                const key = `${particle.type}_${particle.color}_${particle.size}`;
                if (!this.renderBatches.has(key)) {
                    this.renderBatches.set(key, []);
                }
                this.renderBatches.get(key).push(particle);
            }
        }
    }
    
    checkGPUSupport() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        return !!gl;
    }
    
    throttleEffects() {
        const now = performance.now();
        const deltaTime = now - this.lastFrameTime;
        
        if (deltaTime < this.frameBudget) {
            return false; // Skip effect generation denne frame
        }
        
        this.lastFrameTime = now;
        return true;
    }

    createEffectSequence(effects) {
        if (!this.throttleEffects()) return;
        
        effects.forEach(effect => {
            const pooledEffect = this.getEffectFromPool();
            if (pooledEffect) {
                pooledEffect.config = effect;
                pooledEffect.scheduledTime = Date.now() + effect.delay;
                this.effectQueue.push(pooledEffect);
            }
        });
    }
    
    cleanup() {
        // Returnér inaktive effekter og partikler til deres pools
        for (const effect of this.activeEffects) {
            if (!effect.active) {
                effect.reset();
                // Returnér partikler til pool
                effect.particles.forEach(particle => {
                    particle.reset();
                });
            }
        }
        
        // Fjern inaktive effekter fra active listen
        this.activeEffects = this.activeEffects.filter(effect => effect.active);
        
        // Opdater spatial grid og render batches
        this.updateGrid();
        this.optimizeRendering();
    }
}
