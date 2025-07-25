// js/springs.js

// En generisk fysik-fjeder (spring/damper)
export class Spring {
  constructor({
    position = 0,
    velocity = 0,
    target = 0,
    stiffness = 0.1,
    damping = 0.7,
    mass = 1
  } = {}) {
    this.position = position;
    this.velocity = velocity;
    this.target = target;
    this.stiffness = stiffness;
    this.damping = damping;
    this.mass = mass;
  }

  // Opdater fjederen (dt i ms)
  update(dt = 16) {
    const force = -this.stiffness * (this.position - this.target);
    const accel = force / this.mass;
    this.velocity = this.velocity * this.damping + accel * (dt / 16);
    this.position += this.velocity * (dt / 16);
  }

  // Sæt nyt mål for fjederen
  setTarget(target) {
    this.target = target;
  }

  // Sæt ny stiffness
  setStiffness(stiffness) {
    this.stiffness = stiffness;
  }

  // Sæt ny damping
  setDamping(damping) {
    this.damping = damping;
  }

  // Sæt ny mass
  setMass(mass) {
    this.mass = mass;
  }

  // Hent den aktuelle værdi
  getValue() {
    return this.position;
  }

  // Euler integration
  updateEuler(dt = 16) {
    const force = -this.stiffness * (this.position - this.target);
    const accel = force / this.mass;
    this.velocity = this.velocity * this.damping + accel * (dt / 16);
    this.position += this.velocity * (dt / 16);
  }

  // Verlet integration
  updateVerlet(dt = 16) {
    const force = -this.stiffness * (this.position - this.target);
    const accel = force / this.mass;
    const newPosition = this.position * 2 - this.prevPosition * this.damping + accel * (dt / 16) * (dt / 16);
    this.prevPosition = this.position;
    this.position = newPosition;
    this.velocity = (this.position - this.prevPosition) / (dt / 16);
  }
}

// Eksempel: Lav en fjeder til et hjul
// const wheelSpring = new Spring({position: 0, target: 10, stiffness: 0.12, damping: 0.75});
// wheelSpring.update(16);
// Brug wheelSpring.position som din visuelle offset.
