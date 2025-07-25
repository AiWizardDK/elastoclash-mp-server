export class TerrainEffects {
    constructor(terrain, effects) {
        this.terrain = terrain;
        this.effects = effects;
        this.hazards = [];
        this.particlePool = [];
        this.maxPoolSize = 1000;
        this.activeParticles = new Set();

        // Track elapsed time for particle emission per hazard
        this.hazardParticleTimers = new Map();

        // Track elapsed time for hazard effects per hazard
        this.hazardEffectTimers = new Map();

        // Track total particles created to limit max particles
        this.totalParticlesCreated = 0;
    }

    addHazard(type, x, y, width = 100) {
        const hazard = {
            type,
            x,
            y,
            width,
            active: true
        };
        this.hazards.push(hazard);
        this.hazardParticleTimers.set(hazard, 0);
        this.hazardEffectTimers.set(hazard, 0);
        return hazard;
    }
    
    /**
     * Fjerner en hazard fra systemet
     * @param {Object} hazard - Hazard objektet der skal fjernes
     */
    removeHazard(hazard) {
        const index = this.hazards.indexOf(hazard);
        if (index !== -1) {
            this.hazards.splice(index, 1);
            this.hazardParticleTimers.delete(hazard);
            this.hazardEffectTimers.delete(hazard);
        }
    }

    update(delta, bike) {
        // Cache current time once per update
        const now = Date.now();

        // Update particles first
        this.updateParticles(delta);

        // Opdater hazard effekter
        this.hazards.forEach(hazard => {
            if (!hazard.active) return;

            const terrainType = TERRAIN_TYPES[hazard.type];

            // Update timers
            let particleTimer = this.hazardParticleTimers.get(hazard) || 0;
            let effectTimer = this.hazardEffectTimers.get(hazard) || 0;
            particleTimer += delta;
            effectTimer += delta;

            // Tjek om spilleren er på denne hazard
            if (bike.x >= hazard.x && bike.x <= hazard.x + hazard.width) {
                // Anvend effekter
                if (terrainType.damage && effectTimer > 100) {
                    bike.health -= terrainType.damage;
                    this.effects.playCollisionEffect(bike.x, bike.y, terrainType.damage * 10);
                    effectTimer = 0;
                }

                if (terrainType.slowdown) {
                    bike.speed *= terrainType.slowdown;
                }

                if (terrainType.boost && effectTimer > 500) {
                    bike.speed *= terrainType.boost;
                    this.effects.playBoostEffect(bike.x, bike.y);
                    effectTimer = 0;
                }
            }

            // Particle effekter
            if (terrainType.particleRate) {
                const particleInterval = 1000 / (terrainType.particleRate * 60);
                if (particleTimer > particleInterval) {
                    const x = hazard.x + Math.random() * hazard.width;
                    const y = this.terrain.getHeightAt(x);

                    // Use particle pool
                    const particle = this.getParticleFromPool();
                    if (particle) {
                        particle.x = x;
                        particle.y = y;
                        particle.vx = (Math.random() - 0.5) * 2;
                        particle.vy = -Math.random() * 3;
                        particle.life = 1000;
                        particle.color = terrainType.particleColor || terrainType.particleColors?.[0] || terrainType.color;
                        particle.colors = terrainType.particleColors;
                        // Use terrain-specific gravity or default to -0.05
                        particle.gravity = terrainType.gravity !== undefined ? terrainType.gravity : -0.05;
                        particle.alpha = 1;
                        this.activeParticles.add(particle);
                    }

                    particleTimer = 0;
                }
            }

            this.hazardParticleTimers.set(hazard, particleTimer);
            this.hazardEffectTimers.set(hazard, effectTimer);
        });
    }

    /**
     * Henter en particle fra poolen eller opretter en ny hvis poolen ikke er fuld
     * @returns {Object|null} Particle objekt eller null hvis poolen er fuld
     */
    getParticleFromPool() {
        // Prøv først at hente fra poolen
        let particle = this.particlePool.pop();
        
        // Hvis ingen particle i poolen og vi kan oprette flere
        if (!particle && this.totalParticlesCreated < this.maxPoolSize) {
            // Opret ny particle med standardværdier
            particle = Object.create(null); // Object.create er hurtigere end {} for simple objekter
            particle.x = 0;
            particle.y = 0;
            particle.vx = 0;
            particle.vy = 0;
            particle.life = 0;
            particle.color = '#ffffff';
            particle.colors = null;
            particle.gravity = 0;
            particle.alpha = 1;
            
            this.totalParticlesCreated++;
        }
        
        return particle;
    }

    returnParticleToPool(particle) {
        if (this.particlePool.length < this.maxPoolSize) {
            this.particlePool.push(particle);
        }
    }

    updateParticles(delta) {
        for (const particle of this.activeParticles) {
            particle.x += particle.vx * delta;
            particle.y += particle.vy * delta;
            particle.vy += particle.gravity * delta;
            particle.life -= delta;
            particle.alpha = Math.max(0, particle.life / 1000);

            if (particle.life <= 0) {
                this.activeParticles.delete(particle);
                this.returnParticleToPool(particle);
            }
        }
    }

    draw(ctx) {
        // Cache current time once per draw
        const now = Date.now();

        // Draw particles first for better layering
        ctx.save();
        for (const particle of this.activeParticles) {
            ctx.globalAlpha = particle.alpha;
            if (particle.colors) {
                const colorIndex = Math.floor(now / 100) % particle.colors.length;
                ctx.fillStyle = particle.colors[colorIndex];
            } else {
                ctx.fillStyle = particle.color;
            }

            // Draw particle with glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // Tegn baggrundslag for terræn
        ctx.save();

        // Tegn hazard zoner med gradient effekter
        this.hazards.forEach(hazard => {
            const terrainType = TERRAIN_TYPES[hazard.type];
            const y = this.terrain.getHeightAt(hazard.x);

            // Opret gradient
            const gradient = ctx.createLinearGradient(
                hazard.x, y,
                hazard.x, y + 50
            );
            gradient.addColorStop(0, terrainType.color);
            gradient.addColorStop(1, terrainType.background);

            // Tegn hazard zone
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(hazard.x, y);

            // Tegn kurvet overflade
            for (let x = 0; x <= hazard.width; x += 10) {
                const currentX = hazard.x + x;
                const currentY = this.terrain.getHeightAt(currentX);
                const wave = Math.sin(now / 500 + x / 30) * 5;

                if (x === 0) {
                    ctx.moveTo(currentX, currentY);
                } else {
                    ctx.lineTo(currentX, currentY + wave);
                }
            }

            // Afslut path ned til bunden
            ctx.lineTo(hazard.x + hazard.width, ctx.canvas.height);
            ctx.lineTo(hazard.x, ctx.canvas.height);
            ctx.closePath();
            ctx.fill();

            // Tilføj glow effekt for særlige hazards
            if (terrainType.particleColors) {
                ctx.save();
                ctx.globalAlpha = 0.3;
                ctx.shadowColor = terrainType.particleColors[0];
                ctx.shadowBlur = 20;
                ctx.fill();
                ctx.restore();
            }
        });

        ctx.restore();
    }
}