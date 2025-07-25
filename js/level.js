// js/level.js
import { TERRAIN_TYPES } from './terrain-effects.js';

// Level generation constants
const LEVEL_WIDTH_MULTIPLIER = 3;
const DEFAULT_SEGMENT_SIZE = 100;
const INITIAL_Y_POSITION_MULTIPLIER = 0.7;
const Y_BOUND_PADDING = 100;
const ROUGHNESS_VARIATION_MAX = 50;
const ROUGHNESS_VARIATION_OFFSET = 25;
const CHECKPOINT_COUNT = 5;
const COLLECTIBLE_X_START_MULTIPLIER = 0.3;
const COLLECTIBLE_X_RANGE_MULTIPLIER = 0.6;
const COLLECTIBLE_Y_OFFSET = 50;
const COLLECTIBLE_Y_RANDOM_RANGE = 100;
const ON_TRACK_TOLERANCE = 20;

export class Level {
    constructor(canvas, difficulty = 'medium') {
        this.canvas = canvas;
        this.difficulty = difficulty;
        this.width = canvas.width * LEVEL_WIDTH_MULTIPLIER;  // Level er 3x canvas bredde
        this.segmentSize = DEFAULT_SEGMENT_SIZE;
        this.heightVariation = this.getDifficultyValue(0.2, 0.4, 0.6);
        this.roughness = this.getDifficultyValue(0.3, 0.5, 0.7);
        this.points = []; // Initialize points array
    }

    getDifficultyValue(easy, medium, hard) {
        switch(this.difficulty) {
            case 'easy': return easy;
            case 'hard': return hard;
            default: return medium;
        }
    }

    generate() {
        const points = [];
        const hazards = [];
        const checkpoints = [];
        const collectibles = [];
        
        // Generer terræn punkter
        let x = 0;
        let y = this.canvas.height * INITIAL_Y_POSITION_MULTIPLIER;
        const segments = Math.ceil(this.width / this.segmentSize);
        
        for (let i = 0; i <= segments; i++) {
            // Smooth noise for height
            y += (Math.random() - 0.5) * this.canvas.height * this.heightVariation;
            y = Math.max(Y_BOUND_PADDING, Math.min(this.canvas.height - Y_BOUND_PADDING, y));
            
            // Tilføj variation baseret på roughness
            if (Math.random() < this.roughness) {
                const variation = Math.random() * ROUGHNESS_VARIATION_MAX - ROUGHNESS_VARIATION_OFFSET;
                points.push({ x, y: y + variation });
            }
            
            points.push({ x, y });
            x += this.segmentSize;
        }
        // Tilføj hazards baseret på sværhedsgrad
        const hazardCount = this.getDifficultyValue(2, 4, 6);
        const hazardTypes = Object.keys(TERRAIN_TYPES).filter(type => type !== 'NORMAL');
        
        for (let i = 0; i < hazardCount; i++) {
            const startX = this.canvas.width * 0.5 + (this.width - this.canvas.width) * (i / hazardCount);
            const width = this.getDifficultyValue(100, 150, 200);
            const type = hazardTypes[Math.floor(Math.random() * hazardTypes.length)];
            
            hazards.push({
                type,
                x: startX,
                width
            });
        }

        // Placer checkpoints
        const checkpointCount = CHECKPOINT_COUNT;
        for (let i = 1; i <= checkpointCount; i++) {
            const x = (this.width * i) / (checkpointCount + 1);
            checkpoints.push({
                x,
                reached: false
            });
        }

        // Tilføj collectibles
        const collectibleCount = this.getDifficultyValue(10, 15, 20);
        for (let i = 0; i < collectibleCount; i++) {
            const x = this.canvas.width * COLLECTIBLE_X_START_MULTIPLIER + Math.random() * (this.width - this.canvas.width * COLLECTIBLE_X_RANGE_MULTIPLIER);
            const baseY = this.getHeightAt(points, x);
            collectibles.push({
                x,
                y: baseY - COLLECTIBLE_Y_OFFSET - Math.random() * COLLECTIBLE_Y_RANDOM_RANGE,
                collected: false
            });
        }

        this.points = points; // Store generated points in the instance
        return {
            points,
            hazards,
            checkpoints,
            collectibles
        };
    }

    getHeightAt(points, x) {
        // Find de to punkter der omgiver x
        let i = 0;
        while (i < points.length - 1 && points[i + 1].x < x) i++;
        
        if (i >= points.length - 1) return points[points.length - 1].y;
        
        const p1 = points[i];
        const p2 = points[i + 1];
        
        // Lineær interpolation
        const t = (x - p1.x) / (p2.x - p1.x);
        return p1.y + t * (p2.y - p1.y);
    }

    // (Valgfrit) collision detection med banen – tjekker om punktet er tæt på et segment
    isOnTrack(x, y, tolerance = ON_TRACK_TOLERANCE) {
        for (let i = 1; i < this.points.length; i++) {
            const a = this.points[i - 1];
            const b = this.points[i];
            const d = pointToSegmentDistance(x, y, a.x, a.y, b.x, b.y);
            if (d < tolerance) return true;
        }
        return false;
    }
}

// Hjælpefunktion – afstand fra punkt til linjestykke
function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) param = dot / len_sq;
    let xx, yy;
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
}
