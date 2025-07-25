// js/bike.js

import { controls } from './controls.js';

/**
 * Repræsenterer en motorcykel i spillet med fysik og styring
 * @class
 */
export class Bike {
  /**
   * Opretter en ny motorcykel instans
   * @param {number} x - Start X position
   * @param {number} y - Start Y position
   * @param {string} color - Motorcyklens farve
   * @param {string} name - Spillerens navn
   */
  constructor(x, y, color = 'blue', name = 'Player') {
    // Position og bevægelse
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.speed = 0;
    
    // Køretøjsegenskaber
    this.maxSpeed = 12;
    this.acceleration = 0.35;
    this.turnSpeed = 0.04;
    this.gravity = 0.45;
    this.boostSpeed = 15;
    this.jumpForce = -10;
    
    // Kontrol og fysik parametre
    this.grounded = false;
    this.airControl = 0.3;
    this.groundFriction = 0.95;
    this.airFriction = 0.99;
    this.suspension = {
      compression: 0,
      maxCompression: 0.3,
      stiffness: 0.2,
      damping: 0.1
    };
    
    // Visuelle egenskaber
    this.color = color;
    this.name = name;
    this.trail = [];
    this.trailMaxLength = 100;
    this.particleEffects = [];
    
    // Gameplay tilstand
    this.isAlive = true;
    this.crashResistance = 1.0;
    this.energy = 100;
    this.boost = 100;
    
    // Power-up system
    this.activePowerUps = [];
    this.isShielded = false;
    this.powerUpEffects = {
      speed: 1,
      handling: 1,
      jumpHeight: 1,
      protection: 1
    };
  }

  /**
   * Opdaterer motorcyklens tilstand
   * @param {number} delta - Tid siden sidste update i ms
   * @param {Object} controls - Kontroltilstand
   * @param {Object} terrain - Terrændata
   */
  update(delta, controls, terrain) {
    if (!this.isAlive) return;

    const deltaTime = delta / 16; // Normalize to 60 FPS

    // Opdater power-ups og deres effekter
    this.updatePowerUps();
    
    // Energi regeneration når der ikke boostes
    if (this.energy < 100 && !controls.action) {
      this.energy = Math.min(100, this.energy + 0.2 * deltaTime);
    }
    
    // Boost system med energi forbrug
    const canBoost = this.energy > 20 && this.grounded;
    if (controls.up && controls.action && canBoost) {
      const boostMultiplier = this.powerUpEffects.speed;
      this.speed = Math.min(
        this.speed + (this.acceleration * 2) * deltaTime * boostMultiplier, 
        this.boostSpeed * boostMultiplier
      );
      this.energy = Math.max(0, this.energy - 1 * deltaTime);
      this.addBoostEffect();
    }
    
    if (controls.left) {
      // Mere præcis luftkontrol baseret på hastighed
      const airMultiplier = this.grounded ? 1 : (1 + (this.speed / this.maxSpeed) * 0.5);
      this.angle -= this.turnSpeed * deltaTime * controlMultiplier * airMultiplier;
      if (!this.grounded) {
        // Bedre luftmodstandshåndtering
        const airResistance = Math.min(1, this.speed / this.maxSpeed);
        this.vx -= this.airControl * deltaTime * airResistance;
        // Tillad lille rotation i luften
        this.angle -= this.turnSpeed * 0.2 * deltaTime;
      }
    }
    if (controls.right) {
      const airMultiplier = this.grounded ? 1 : (1 + (this.speed / this.maxSpeed) * 0.5);
      this.angle += this.turnSpeed * deltaTime * controlMultiplier * airMultiplier;
      if (!this.grounded) {
        const airResistance = Math.min(1, this.speed / this.maxSpeed);
        this.vx += this.airControl * deltaTime * airResistance;
        this.angle += this.turnSpeed * 0.2 * deltaTime;
      }
    }
    
    // Forbedret jordkontrol
    if (this.grounded) {
      if (controls.up) {
        if (controls.action) {
          // Boost
          this.speed = Math.min(this.speed + (this.acceleration * 2) * deltaTime, this.boostSpeed);
        } else {
          // Normal acceleration
          this.speed = Math.min(this.speed + this.acceleration * deltaTime, this.maxSpeed);
        }
      } else if (controls.down) {
        // Avanceret bremsesystem
        if (this.speed > this.maxSpeed * 0.7) {
          // Hård opbremsning ved høj fart
          this.speed = Math.max(this.speed - (this.acceleration * 2) * deltaTime, 0);
          // Tilføj bremsespor effekt
          this.addBrakeEffect();
        } else {
          // Normal bremsning ved lav fart
          this.speed = Math.max(this.speed - this.acceleration * deltaTime, 0);
        }
      } else {
        // Dynamisk friktion baseret på terræn
        const terrainFriction = this.getTerrainFriction();
        this.speed *= this.groundFriction * terrainFriction;
      }
      
      // Avanceret springsystem
      if (controls.action && !controls.up) { // Kun spring hvis ikke boosting
        // Beregn spring kraft baseret på hastighed og terræn hældning
        const terrainAngleFactor = Math.abs(Math.cos(this.angle));
        const speedFactor = this.speed / this.maxSpeed;
        
        // Base spring + hastigheds bonus + rampe bonus
        const jumpPower = this.jumpForce * (1 + speedFactor * 0.5) * (1 + (1 - terrainAngleFactor) * 0.8);
        
        // Tilføj forward momentum og bevar noget af den horisontale hastighed
        this.vy = jumpPower;
        this.vx = this.speed * Math.cos(this.angle) * 0.8;
        
        this.grounded = false;
        
        // Tilføj hop-effekt
        this.addJumpEffect();
      }
    } else {
      // Luftmodstand
      this.speed *= this.airFriction;
    }

    // Bevægelse
    this.vx = Math.cos(this.angle) * this.speed;
    
    // Tilføj tyngdekraft hvis vi ikke er på jorden
    if (!this.grounded) {
      this.vy += this.gravity * deltaTime;
    }

    // Opdater position
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Tjek kollision med terræn
    if (terrain && terrain.checkCollision(this.x, this.y)) {
      // Find terræn højde ved vores x-position
      let i = 0;
      while (i < terrain.points.length - 1 && terrain.points[i + 1].x < this.x) {
        i++;
      }
      const p1 = terrain.points[i];
      const p2 = terrain.points[i + 1];
      const terrainY = p1.y + (p2.y - p1.y) * (this.x - p1.x) / (p2.x - p1.x);
      
      // Placer os på terrænet
      this.y = terrainY;
      this.vy = 0;
      this.grounded = true;
      
      // Juster vinkel til terrænet
      const terrainAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      this.angle = terrainAngle;
    } else {
      this.grounded = false;
    }

    // Tilføj position til trail
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 100) {
      this.trail.shift();
    }
  }

  /**
   * Tegner motorcyklen og dens effekter
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    // Tegn partikeleffekter
    this.updateAndDrawParticles(ctx);
    
    // Trail med dynamisk opacity og farveeffekter
    if (this.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x, this.trail[0].y);
      
      for (let i = 1; i < this.trail.length; i++) {
        const point = this.trail[i];
        ctx.lineTo(point.x, point.y);
        
        // Dynamisk trail farve baseret på type og hastighed
        let color = [0, 255, 255]; // Standard cyan
        if (point.brake) {
          color = [255, 50, 0]; // Rød for bremsespor
        } else if (point.boost) {
          color = [255, 165, 0]; // Orange for boost
        } else if (point.jump) {
          color = [200, 200, 200]; // Hvid for hop
        }
        
        // Gør trail mere gennemsigtig jo ældre den er
        const alpha = (i / this.trail.length) * 0.5;
        const speedIntensity = Math.min(1, this.speed / this.maxSpeed);
        ctx.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
        ctx.lineWidth = 2 + speedIntensity * 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
      }
    }
    
    // Tegn cyklen
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    
    // Chassis
    ctx.fillStyle = this.color;
    ctx.fillRect(-20, -10, 40, 20);
    
    // Hjul
    ctx.beginPath();
    ctx.arc(-15, 10, 8, 0, Math.PI * 2);
    ctx.arc(15, 10, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#333';
    ctx.fill();
    
    // Affjedring
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(-15, 10);
    ctx.moveTo(15, 0);
    ctx.lineTo(15, 10);
    ctx.stroke();
    
    // Førerhus
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(-10, -10);
    ctx.lineTo(10, -10);
    ctx.lineTo(5, -20);
    ctx.lineTo(-5, -20);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
    
    // Hastigheds-effekt når vi kører hurtigt
    if (this.speed > this.maxSpeed * 0.7) {
      const speedRatio = this.speed / this.maxSpeed;
      const boostColor = this.speed > this.maxSpeed ? 'rgba(255, 100, 0, ' : 'rgba(0, 255, 255, ';
      
      ctx.fillStyle = `${boostColor}${speedRatio * 0.3})`;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - Math.cos(this.angle) * 60, this.y - Math.sin(this.angle) * 60);
      ctx.lineTo(this.x - Math.cos(this.angle) * 40, this.y - Math.sin(this.angle) * 40);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Hjælpefunktioner
  addBrakeEffect() {
    // Tilføj bremsespor
    for (let i = 0; i < 3; i++) {
      this.trail.push({
        x: this.x - Math.cos(this.angle) * i * 5,
        y: this.y - Math.sin(this.angle) * i * 5,
        brake: true
      });
    }
  }

  addJumpEffect() {
    // Tilføj støveffekt ved hop
    for (let i = 0; i < 5; i++) {
      const angle = this.angle - Math.PI / 2 + (Math.random() - 0.5);
      const distance = 10 + Math.random() * 10;
      this.trail.push({
        x: this.x + Math.cos(angle) * distance,
        y: this.y + Math.sin(angle) * distance,
        jump: true
      });
    }
  }

  getTerrainFriction() {
    // Returner forskellige friktionsværdier baseret på terræn hældning
    const slope = Math.abs(Math.sin(this.angle));
    if (slope > 0.5) {
      return 0.97; // Mere friktion på stejle skråninger
    } else if (slope > 0.2) {
      return 0.98; // Medium friktion på medium skråninger
    }
    return 0.99; // Normal friktion på fladt terræn
  }

  activatePowerUp(powerUp) {
    const effect = powerUp.getEffect();
    effect.effect(this);
    
    const powerUpInfo = {
      type: powerUp.type,
      effect,
      endTime: Date.now() + effect.duration
    };
    
    this.activePowerUps.push(powerUpInfo);
  }

  updatePowerUps() {
    const now = Date.now();
    
    for (let i = this.activePowerUps.length - 1; i >= 0; i--) {
      const powerUp = this.activePowerUps[i];
      
      if (now >= powerUp.endTime) {
        // Power-up er udløbet, fjern effekten
        powerUp.effect.restore(this);
        this.activePowerUps.splice(i, 1);
      }
    }
  }

  /**
   * Tegner power-up effekter
   * @param {CanvasRenderingContext2D} ctx 
   */
  drawPowerUpEffects(ctx) {
    if (this.activePowerUps.length === 0) return;
    
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Tegn en aura rundt om spilleren for hver aktiv power-up
    this.activePowerUps.forEach((powerUp, index) => {
      const timeLeft = (powerUp.endTime - Date.now()) / 1000;
      const alpha = Math.min(0.6, timeLeft / 2);
      const radius = 30 + Math.sin(Date.now() / 200) * 5;
      
      let color;
      switch(powerUp.type) {
        case 'boost': color = `rgba(255, 100, 0, ${alpha})`; break;
        case 'jump': color = `rgba(0, 255, 100, ${alpha})`; break;
        case 'shield': color = `rgba(100, 100, 255, ${alpha})`; break;
      }
      
      // Tegn pulserende aura
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      
      // Tegn power-up ikon
      const icon = this.getPowerUpIcon(powerUp.type);
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(icon, 0, -radius - 10);
    });
    
    ctx.restore();
  }

  /**
   * Opdaterer og tegner partikeleffekter
   * @param {CanvasRenderingContext2D} ctx 
   */
  updateAndDrawParticles(ctx) {
    // Opdater eksisterende partikler
    for (let i = this.particleEffects.length - 1; i >= 0; i--) {
      const particle = this.particleEffects[i];
      
      // Opdater position
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.1; // Gravity
      particle.life -= 1;
      
      // Fjern døde partikler
      if (particle.life <= 0) {
        this.particleEffects.splice(i, 1);
        continue;
      }
      
      // Tegn partikel
      const alpha = particle.life / particle.maxLife;
      ctx.fillStyle = `rgba(${particle.color.join(',')}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Tilføjer en boost effekt
   */
  addBoostEffect() {
    // Tilføj boost trail punkter
    for (let i = 0; i < 3; i++) {
      this.trail.push({
        x: this.x - Math.cos(this.angle) * i * 8,
        y: this.y - Math.sin(this.angle) * i * 8,
        boost: true
      });
      
      // Tilføj boost partikler
      this.particleEffects.push({
        x: this.x - Math.cos(this.angle) * 20,
        y: this.y - Math.sin(this.angle) * 20,
        vx: (Math.random() - 0.5) * 2 - Math.cos(this.angle) * 5,
        vy: (Math.random() - 0.5) * 2 - Math.sin(this.angle) * 5,
        size: 3 + Math.random() * 2,
        color: [255, 165, 0],
        life: 20,
        maxLife: 20
      });
    }
  }

  /**
   * Henter ikon for power-up type
   * @param {string} type 
   * @returns {string}
   */
  getPowerUpIcon(type) {
    switch(type) {
      case 'boost': return '🚀';
      case 'jump': return '⭐';
      case 'shield': return '🛡️';
      default: return '❓';
    }
  }
}
