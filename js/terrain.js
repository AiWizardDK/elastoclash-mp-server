// js/terrain.js

export class Terrain {
    constructor(canvas, worldWidth) {
        this.points = [];
        this.canvas = canvas;
        this.worldWidth = worldWidth || canvas.width;
        this.generateTerrain();
        
        // Spatial partitioning for collision optimization
        this.cellSize = 200; // Size of each grid cell
        this.grid = new Map(); // Spatial hash grid
        this.rebuildGrid();
    }
    
    rebuildGrid() {
        this.grid.clear();
        
        // Build spatial hash grid
        for (let i = 0; i < this.points.length - 1; i++) {
            const p1 = this.points[i];
            const p2 = this.points[i + 1];
            
            // Get cells this line segment intersects
            const cells = this.getIntersectedCells(p1.x, p1.y, p2.x, p2.y);
            
            // Add segment to each cell
            cells.forEach(cell => {
                if (!this.grid.has(cell)) {
                    this.grid.set(cell, []);
                }
                this.grid.get(cell).push([p1, p2]);
            });
        }
    }
    
    getIntersectedCells(x1, y1, x2, y2) {
        const cells = new Set();
        const startCell = this.getCellKey(x1, y1);
        const endCell = this.getCellKey(x2, y2);
        
        cells.add(startCell);
        if (startCell !== endCell) {
            cells.add(endCell);
            
            // Add cells along the line
            const steps = Math.ceil(Math.abs(x2 - x1) / this.cellSize);
            for (let i = 1; i < steps; i++) {
                const x = x1 + (x2 - x1) * (i / steps);
                const y = y1 + (y2 - y1) * (i / steps);
                cells.add(this.getCellKey(x, y));
            }
        }
        
        return cells;
    }
    
    getCellKey(x, y) {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        return `${cellX},${cellY}`;
    }

    generateTerrain() {
        const segments = Math.floor(this.worldWidth / 50); // Et segment hver 50 pixels
        const segmentWidth = this.worldWidth / segments;
        
        // Generer base punkter
        const basePoints = [];
        for (let i = 0; i <= segments; i++) {
            const x = i * segmentWidth;
            // Dynamisk grundlinje
            let y = this.canvas.height - 150;
            
            // Kompleks terrængenerering med forskellige elementer
            
            // Basis terræn med flere lag af bølger
            y += Math.sin(i * 0.3) * 40; // Lange bløde bakker
            y += Math.sin(i * 0.7) * 25; // Medium bakker
            y += Math.sin(i * 1.5) * 10; // Små detaljer
            
            // Specielle terræn features
            if (i > 5 && i < 10) {
                // Begynder rampe
                y -= Math.pow(i - 5, 1.5) * 3;
            }
            
            if (i > 15 && i < 20) {
                // Double jump ramper
                y -= Math.sin((i - 15) * Math.PI / 5) * 80;
            }
            
            if (i > 25 && i < 28) {
                // Stejl rampe op
                y -= (i - 25) * 25;
            }
            if (i > 28 && i < 31) {
                // Platform
                y -= 75;
            }
            if (i > 31 && i < 34) {
                // Stejl rampe ned
                y -= (34 - i) * 25;
            }
            
            if (i > 40 && i < 45) {
                // Super-rampe
                y -= Math.pow(Math.sin((i - 40) * Math.PI / 5), 2) * 150;
            }
            
            // Små hop gennem hele banen
            if (i % 8 === 0) {
                y -= 20;
            }
            if (i % 8 === 1) {
                y -= 15;
            }
            
            // Sørg for at terrænet ikke går under bunden
            y = Math.min(y, this.canvas.height - 50);
            
            basePoints.push({ x, y });
        }
        
        // Udjævn terrænet med gennemsnit
        for (let i = 1; i < basePoints.length - 1; i++) {
            const smooth = (basePoints[i-1].y + basePoints[i].y + basePoints[i+1].y) / 3;
            this.points.push({ 
                x: basePoints[i].x, 
                y: smooth 
            });
        }
        
        // Tilføj start og slutpunkt
        this.points.unshift(basePoints[0]);
        this.points.push(basePoints[basePoints.length - 1]);
    }

    draw(ctx) {
        // Tegn baggrund med gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a1a2f'); // Mørk nattehimmel
        gradient.addColorStop(1, '#2a2a4f'); // Lysere horisont
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Tegn stjerner
        this.drawStars(ctx);
        
        // Tegn terræn base
        ctx.beginPath();
        ctx.moveTo(0, this.canvas.height);
        ctx.lineTo(this.points[0].x, this.points[0].y);
        
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        
        ctx.lineTo(this.canvas.width, this.canvas.height);
        ctx.closePath();
        
        // Terræn gradient
        const terrainGradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        terrainGradient.addColorStop(0, '#3a5a3a'); // Mørkere græs top
        terrainGradient.addColorStop(1, '#2a3a2a'); // Mørkere jord bund
        ctx.fillStyle = terrainGradient;
        ctx.fill();
        
        // Tegn græs-effekt
        for (let i = 1; i < this.points.length; i++) {
            const x1 = this.points[i-1].x;
            const y1 = this.points[i-1].y;
            const x2 = this.points[i].x;
            const y2 = this.points[i].y;
            
            // Tegn flere græsstrå langs linjen
            const grassCount = Math.floor((x2 - x1) / 5);
            for (let j = 0; j < grassCount; j++) {
                const t = j / grassCount;
                const x = x1 + (x2 - x1) * t;
                const y = y1 + (y2 - y1) * t;
                
                // Tegn individuelt græsstrå
                const height = 3 + Math.random() * 5;
                const lean = (Math.random() - 0.5) * 0.5;
                
                ctx.beginPath();
                ctx.strokeStyle = `rgba(100, 200, 100, ${0.5 + Math.random() * 0.5})`;
                ctx.lineWidth = 1;
                ctx.moveTo(x, y);
                ctx.quadraticCurveTo(
                    x + lean * height,
                    y - height * 0.6,
                    x + lean * height * 2,
                    y - height
                );
                ctx.stroke();
            }
        }
    }

    drawStars(ctx) {
        // Brug vores points array som "seed" for stjernerne
        for (let i = 0; i < this.points.length * 3; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * (this.canvas.height * 0.7); // Kun i øverste 70%
            const size = Math.random() * 2;
            const opacity = 0.2 + Math.random() * 0.5;

            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Tjek om et punkt kolliderer med terrænet
    checkCollision(x, y) {
        // Get the cell this point is in
        const cellKey = this.getCellKey(x, y);
        const segments = this.grid.get(cellKey) || [];
        
        // Also check neighboring cells
        const dx = (x % this.cellSize) / this.cellSize;
        const dy = (y % this.cellSize) / this.cellSize;
        
        // Add neighboring cells if close to boundaries
        if (dx < 0.1) {
            const leftKey = this.getCellKey(x - this.cellSize * 0.1, y);
            const leftSegments = this.grid.get(leftKey);
            if (leftSegments) segments.push(...leftSegments);
        } else if (dx > 0.9) {
            const rightKey = this.getCellKey(x + this.cellSize * 0.1, y);
            const rightSegments = this.grid.get(rightKey);
            if (rightSegments) segments.push(...rightSegments);
        }
        
        // Check each segment in the relevant cells
        for (const [p1, p2] of segments) {
            // Check if x is within segment bounds
            if (x >= Math.min(p1.x, p2.x) && x <= Math.max(p1.x, p2.x)) {
                // Interpolate y-value on the terrain at x
                const terrainY = p1.y + (p2.y - p1.y) * (x - p1.x) / (p2.x - p1.x);
                if (y >= terrainY) return true;
            }
        }
        
        return false;
    }
}
