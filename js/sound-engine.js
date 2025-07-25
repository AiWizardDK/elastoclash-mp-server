// sound-engine.js - Avanceret lydsystem med 3D-positionering og effekter

class SoundEngine {
    constructor() {
        // Opret AudioContext
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Master volume og effekter
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        
        // Reverb effekt
        this.reverb = this.ctx.createConvolver();
        this.createReverb();
        
        // Kompressor for bedre lydbalance
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.value = -24;
        this.compressor.knee.value = 30;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.25;
        
        // Effekt routing
        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.ctx.destination);
        
        // Lyd buffer cache
        this.buffers = new Map();
        this.sources = new Map();
        
        // Liste over alle aktive lyde
        this.activeSounds = new Set();
    }

    async createReverb() {
        // Generer impulse response for reverb
        const length = 2;
        const decay = 2.0;
        const sampleRate = this.ctx.sampleRate;
        const bufferLength = length * sampleRate;
        const buffer = this.ctx.createBuffer(2, bufferLength, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < bufferLength; i++) {
                const t = i / sampleRate;
                channelData[i] = (2 * Math.random() - 1) * Math.pow(1 - t / length, decay);
            }
        }
        
        this.reverb.buffer = buffer;
    }

    async loadSound(name, url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
            this.buffers.set(name, audioBuffer);
        } catch (error) {
            console.error('Fejl ved indlæsning af lyd:', error);
        }
    }

    fastSqrt(x) {
        // Fast inverse square root tilnærmelse
        const xhalf = 0.5 * x;
        let i = x;
        i = 0x5f3759df - (i >> 1);
        x = i * (1.5 - xhalf * i * i);
        return 1 / x;
    }

    play(name, options = {}) {
        const {
            volume = 1,
            loop = false,
            position = null, // {x, y} for 3D lyd
            pitch = 1,
            reverb = 0,
            pan = 0
        } = options;

        if (!this.buffers.has(name)) {
            console.warn(`Lyd "${name}" ikke fundet!`);
            return null;
        }

        // Opret og konfigurer lydkilde
        const source = this.ctx.createBufferSource();
        source.buffer = this.buffers.get(name);
        source.loop = loop;
        source.playbackRate.value = pitch;

        // Volumen kontrol
        const gainNode = this.ctx.createGain();
        gainNode.gain.value = volume;

        // Stereo panorering
        const panNode = this.ctx.createStereoPanner();
        panNode.pan.value = pan;

        // Reverb mix
        const dryGain = this.ctx.createGain();
        const wetGain = this.ctx.createGain();
        dryGain.gain.value = 1 - reverb;
        wetGain.gain.value = reverb;

        // Sammenkæd nodes
        source.connect(gainNode);
        gainNode.connect(panNode);
        panNode.connect(dryGain);
        panNode.connect(this.reverb);
        this.reverb.connect(wetGain);
        dryGain.connect(this.masterGain);
        wetGain.connect(this.masterGain);

        // Start afspilning
        source.start(0);
        
        // Gem reference til aktiv lyd
        const sound = { source, gainNode, panNode, options };
        this.activeSounds.add(sound);
        
        // Fjern reference når lyden er færdig
        source.onended = () => {
            this.activeSounds.delete(sound);
        };

        return sound;
    }

    update(camera) {
        // Opdater 3D lyd positioner baseret på kamera
        for (const sound of this.activeSounds) {
            if (sound.options.position) {
                const dx = sound.options.position.x - camera.x;
                const dy = sound.options.position.y - camera.y;
                
                // Beregn afstand
                const distance = dx * dx + dy * dy;
                const fastDistance = this.fastSqrt(distance);
                const maxDistance = 1000; // Max afstand hvor lyden kan høres
                
                // Beregn volume baseret på afstand
                const volume = Math.max(0, 1 - fastDistance / maxDistance);
                sound.gainNode.gain.value = volume * sound.options.volume;
                
                // Beregn panorering baseret på x-position
                const pan = Math.max(-1, Math.min(1, dx / maxDistance));
                sound.panNode.pan.value = pan;
            }
        }
    }

    // Præ-definerede lydeffekter
    playEngine(speed, load) {
        const pitch = 0.5 + speed * 0.5;
        const volume = 0.3 + load * 0.2;
        return this.play('engine', { 
            loop: true, 
            pitch, 
            volume,
            reverb: 0.1
        });
    }

    playCollision(velocity) {
        const volume = Math.min(1, velocity * 0.1);
        const pitch = 0.8 + Math.random() * 0.4;
        this.play('crash', { 
            volume, 
            pitch,
            reverb: 0.2
        });
    }

    playBoost() {
        this.play('boost', {
            volume: 0.8,
            pitch: 1.2,
            reverb: 0.15
        });
    }

    playCheckpoint() {
        this.play('checkpoint', {
            volume: 0.7,
            pitch: 1,
            reverb: 0.3
        });
    }

    playCollect() {
        this.play('collect', {
            volume: 0.6,
            pitch: 1 + Math.random() * 0.2,
            reverb: 0.1
        });
    }
}

// Eksporter en singleton instance
export const soundEngine = new SoundEngine();

// Forhåndsindlæs alle lyde
export async function preloadSounds() {
    await Promise.all([
        soundEngine.loadSound('engine', 'assets/engine.mp3'),
        soundEngine.loadSound('crash', 'assets/crash.mp3'),
        soundEngine.loadSound('boost', 'assets/boost.mp3'),
        soundEngine.loadSound('checkpoint', 'assets/checkpoint.mp3'),
        soundEngine.loadSound('collect', 'assets/collect.mp3')
    ]);
}
