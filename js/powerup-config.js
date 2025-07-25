// powerup-config.js - Konfiguration af power-ups

const powerUpConfig = {
    boost: {
        duration: 5000,
        effect: (bike) => {
            bike.maxSpeed *= 1.5;
            bike.acceleration *= 1.3;
        },
        restore: (bike) => {
            bike.maxSpeed /= 1.5;
            bike.acceleration /= 1.3;
        },
        color: 'rgba(255, 100, 0, ${alpha})',
        drawIcon: (ctx) => {
            ctx.beginPath();
            ctx.moveTo(-5, -8);
            ctx.lineTo(10, 0);
            ctx.lineTo(-5, 8);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    },
    jump: {
        duration: 8000,
        effect: (bike) => {
            bike.jumpForce *= 1.4;
            bike.airControl *= 1.3;
        },
        restore: (bike) => {
            bike.jumpForce /= 1.4;
            bike.airControl /= 1.3;
        },
        color: 'rgba(0, 255, 100, ${alpha})',
        drawIcon: (ctx) => {
            ctx.beginPath();
            ctx.moveTo(-8, 8);
            ctx.lineTo(0, -8);
            ctx.lineTo(8, 8);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    },
    shield: {
        duration: 10000,
        effect: (bike) => {
            bike.isShielded = true;
        },
        restore: (bike) => {
            bike.isShielded = false;
        },
        color: 'rgba(100, 100, 255, ${alpha})',
        drawIcon: (ctx) => {
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
    },
    gravityFlip: {
        duration: 7000,
        effect: (bike) => {
            bike.gravity *= -1;
        },
        restore: (bike) => {
            bike.gravity *= -1;
        },
        color: 'rgba(200, 50, 200, ${alpha})',
        drawIcon: (ctx) => {
            ctx.beginPath();
            ctx.moveTo(-5, 8);
            ctx.lineTo(0, 0);
            ctx.lineTo(5, 8);
            ctx.lineTo(0, -8);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    },
    slowMotion: {
        duration: 6000,
        effect: (bike) => {
            bike.timeScale = 0.5;
        },
        restore: (bike) => {
            bike.timeScale = 1;
        },
        color: 'rgba(50, 200, 200, ${alpha})',
        drawIcon: (ctx) => {
            ctx.beginPath();
            ctx.arc(0, 0, 5, 0, Math.PI * 2);
            ctx.moveTo(0, -5);
            ctx.lineTo(0, -10);
            ctx.stroke();
        }
    }
};

export default powerUpConfig;
