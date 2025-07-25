// js/game.js
import { Bike } from './bike.js';
import { EffectSystem } from './effects.js';
import { ParticleSystem } from './particles.js';
import { PowerupSystem } from './powerups.js';
import { ObstacleSystem } from './obstacles.js';
import { SoundManager } from './sounds.js';
import { StorageManager } from './storage.js';
import { NetworkManager } from './network.js';
import { AchievementSystem } from './achievements.js';
import { Controls } from './controls.js';
import { Terrain } from './terrain.js';
import { Level } from './level.js';

// Constants
const SAVE_GAME_KEY = 'elastoclash_savegame';
const SETTINGS_KEY = 'elastoclash_settings';
const HIGH_SCORES_KEY = 'elastoclash_highscores';

// Game Configuration Constants
const WORLD_BOUNDS_RIGHT = 5000;
const WORLD_BOUNDS_TOP = -1000; // Allow for air tricks
const WORLD_BOUNDS_BOTTOM_OFFSET = 500; // Death zone buffer

const AUTO_SAVE_INTERVAL_MS = 30000; // 30 seconds
const SAVE_GAME_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const SLOW_MOTION_ENERGY_COST = 10;
const SLOW_MOTION_TIME_SCALE = 0.3;

const COMBO_MULTIPLIER_INCREMENT = 0.1;
const MAX_COMBO_MULTIPLIER = 5.0;

const BIKE_DAMPING_FACTOR = 0.9;
const OBSTACLE_DAMAGE = 10;
const COLLISION_EFFECT_MAGNITUDE = 50;

const CAMERA_POSITION_SMOOTHING = 0.1;
const CAMERA_ROTATION_SMOOTHING = 0.05;
const CAMERA_ZOOM_SMOOTHING = 0.1;
const CAMERA_SHAKE_TRAUMA_DECREMENT = 0.05;
const CAMERA_X_OFFSET_DIVISOR = 3;
const CAMERA_Y_OFFSET_DIVISOR = 2;

const MIN_BIKE_SPEED_FOR_DRIVE_SOUND = 0.1;
const DRIVE_SOUND_VOLUME_DIVISOR = 10;

const MIN_HEALTH_FOR_GAME_OVER = 0;
const MS_TO_SECONDS_DIVISOR = 1000;

// UI Constants
const UI_TEXT_X_OFFSET = 20;
const UI_SCORE_Y = 40;
const UI_TIME_Y = 70;
const UI_HEALTH_Y = 100;
const FPS_TEXT_X_OFFSET = 100;

const MAIN_PANEL_WIDTH = 200;
const MAIN_PANEL_HEIGHT = 150;
const MAIN_PANEL_X_OFFSET = 20;
const MAIN_PANEL_Y_OFFSET = 20;
const MAIN_PANEL_TEXT_X_OFFSET = 10;
const MAIN_PANEL_DIFFICULTY_Y = 30;
const MAIN_PANEL_LEVEL_Y = 60;
const MAIN_PANEL_COINS_Y = 90;
const MAIN_PANEL_CHECKPOINTS_Y = 120;

const BOOST_METER_WIDTH = 150;
const BOOST_METER_HEIGHT = 20;
const BOOST_METER_Y_OFFSET = 40;
const BOOST_METER_TEXT_X_OFFSET = 10;
const BOOST_METER_TEXT_Y_OFFSET = 15;

const HEALTH_BAR_WIDTH = 150;
const HEALTH_BAR_HEIGHT = 20;
const HEALTH_BAR_X_OFFSET = 20;
const HEALTH_BAR_Y_OFFSET = 40;
const HEALTH_BAR_COLOR_THRESHOLD = 0.3;
const HEALTH_BAR_TEXT_X_OFFSET = 10;
const HEALTH_BAR_TEXT_Y_OFFSET = 15;

const MINIMAP_WIDTH = 200;
const MINIMAP_HEIGHT = 100;
const MINIMAP_X_OFFSET = 20;
const MINIMAP_Y_OFFSET = 20;
const MINIMAP_LINE_WIDTH = 2;
const MINIMAP_BIKE_RADIUS = 10;

const PAUSED_OVERLAY_ALPHA = 0.7;
const PAUSED_TEXT_FONT = '48px Arial';

const DEBUG_PANEL_WIDTH = 180;
const DEBUG_PANEL_Y_OFFSET = 60;
const DEBUG_PANEL_HEIGHT = 100;
const DEBUG_PANEL_X_OFFSET = 200;
const DEBUG_TEXT_START_Y = 80;
const DEBUG_TEXT_LINE_HEIGHT = 20;
const DEBUG_TEXT_X_OFFSET = 190;

const NUM_STARS = 100;
const MIN_STAR_RADIUS = 0.5;
const MAX_STAR_RADIUS_OFFSET = 2;
const MIN_STAR_PARALLAX = 0.05;
const MAX_STAR_PARALLAX_OFFSET = 0.2;

const NUM_CLOUDS = 5;
const MIN_CLOUD_WIDTH = 50;
const MAX_CLOUD_WIDTH_OFFSET = 100;
const MIN_CLOUD_HEIGHT = 15;
const MAX_CLOUD_HEIGHT_OFFSET = 30;
const MIN_CLOUD_PARALLAX = 0.02;
const MAX_CLOUD_PARALLAX_OFFSET = 0.1;

const COLLECTIBLE_RADIUS = 10;
const COLLECTIBLE_GLOW_BLUR = 15;
const COLLECTIBLE_PULSE_SPEED = 200;
const COLLECTIBLE_PULSE_MIN_OFFSET = 2;
const COLLECTIBLE_PULSE_MAX_OFFSET = 10;
const COLLECTIBLE_PULSE_LINE_WIDTH = 2;

const BIKE_SHADOW_Y_OFFSET = 5;
const BIKE_SHADOW_WIDTH = 30;
const BIKE_SHADOW_HEIGHT = 10;
const BIKE_SHADOW_ALPHA = 0.3;

const DEFAULT_START_LEVEL = 1;
const DEFAULT_START_CHECKPOINT = 0;
const LOADING_TOTAL_PROGRESS = 100;


// Game state constants
export const GameState = {
    MENU: 'menu',
    LOADING: 'loading',
    TUTORIAL: 'tutorial',
    PLAYING: 'playing',
    PAUSED: 'paused',
    SLOW_MOTION: 'slowMotion',
    REPLAY: 'replay',
    GAME_OVER: 'gameOver',
    VICTORY: 'victory',
    LEADERBOARD: 'leaderboard',
    ACHIEVEMENT_VIEW: 'achievementView',
    LEVEL_SELECT: 'levelSelect',
    CUSTOMIZATION: 'customization'
};

export const GameDifficulty = {
    EASY: { 
        name: 'Easy',
        scoreMultiplier: 1.0,
        checkpointBonus: 500,
        timeLimit: 300,
        gravity: 0.4,
        friction: 1.1
    },
    MEDIUM: {
        name: 'Medium',
        scoreMultiplier: 1.5,
        checkpointBonus: 1000,
        timeLimit: 240,
        gravity: 0.45,
        friction: 1.0
    },
    HARD: {
        name: 'Hard',
        scoreMultiplier: 2.0,
        checkpointBonus: 2000,
        timeLimit: 180,
        gravity: 0.5,
        friction: 0.9
    },
    EXTREME: {
        name: 'Extreme',
        scoreMultiplier: 3.0,
        checkpointBonus: 5000,
        timeLimit: 120,
        gravity: 0.55,
        friction: 0.8
    }
};

export class GameStateManager {
    constructor() {
        this._state = {
            currentState: GameState.MENU,
            previousState: null,
            running: false,
            loading: {
                progress: 0,
                total: 0,
                message: ''
            },
            gameplay: {
                time: 0,
                score: 0,
                combo: 0,
                multiplier: 1,
                checkpoint: 0,
                coins: 0,
                health: 100,
                energy: 100,
                boost: 100
            },
            session: {
                totalScore: 0,
                totalTime: 0,
                racesCompleted: 0,
                bestTimes: {},
                achievements: new Set()
            },
            settings: {
                difficulty: 'MEDIUM',
                music: true,
                sfx: true,
                particles: true,
                cameraShake: true,
                showFps: false
            },
            physics: {
                gravity: GameDifficulty.MEDIUM.gravity,
                friction: GameDifficulty.MEDIUM.friction,
                wind: 0,
                timeScale: 1.0
            },
            victory: false
        };
        
        this._listeners = new Set();
    }

    get state() {
        return { ...this._state };
    }

    setState(updates) {
        const oldState = { ...this._state };
        this._state = { ...this._state, ...updates };
        this._notifyListeners(oldState, this._state);
    }

    addListener(callback, filter = null) {
        const listener = { callback, filter };
        this._listeners.add(listener);
        return () => this._listeners.delete(listener);
    }

    _notifyListeners(oldState, newState) {
        this._listeners.forEach(({callback, filter}) => {
            if (!filter || filter(oldState, newState)) {
                callback(oldState, newState);
            }
        });
    }

    _updateDifficultySettings(difficulty) {
        const settings = GameDifficulty[difficulty.toUpperCase()];
        if (!settings) throw new Error(`Invalid difficulty: ${difficulty}`);
        
        this.setState({
            settings: {
                ...this._state.settings,
                difficulty: difficulty.toUpperCase()
            },
            physics: {
                ...this._state.physics,
                gravity: settings.gravity,
                friction: settings.friction
            }
        });
    }

    reset(difficulty = 'MEDIUM') {
        this._updateDifficultySettings(difficulty);
        
        this.setState({
            currentState: GameState.PLAYING,
            previousState: GameState.MENU,
            running: true,
            gameplay: {
                time: 0,
                score: 0,
                combo: 0,
                multiplier: 1,
                checkpoint: 0,
                coins: 0,
                health: 100,
                energy: 100,
                boost: 100
            },
            victory: false
        });
    }

    pause() {
        if (this._state.currentState === GameState.PLAYING) {
            this.setState({ 
                currentState: GameState.PAUSED,
                previousState: this._state.currentState,
                running: false,
                physics: {
                    ...this._state.physics,
                    timeScale: 0
                }
            });
        }
    }

    resume() {
        if (this._state.currentState === GameState.PAUSED) {
            this.setState({ 
                currentState: this._state.previousState || GameState.PLAYING,
                previousState: GameState.PAUSED,
                running: true,
                physics: {
                    ...this._state.physics,
                    timeScale: 1.0
                }
            });
        }
    }

    enterSlowMotion() {
        if (this._state.gameplay.energy >= SLOW_MOTION_ENERGY_COST) {
            this.setState({
                currentState: GameState.SLOW_MOTION,
                previousState: this._state.currentState,
                physics: {
                    ...this._state.physics,
                    timeScale: SLOW_MOTION_TIME_SCALE
                },
                gameplay: {
                    ...this._state.gameplay,
                    energy: this._state.gameplay.energy - SLOW_MOTION_ENERGY_COST
                }
            });
        }
    }

    exitSlowMotion() {
        if (this._state.currentState === GameState.SLOW_MOTION) {
            this.setState({
                currentState: this._state.previousState || GameState.PLAYING,
                previousState: GameState.SLOW_MOTION,
                physics: {
                    ...this._state.physics,
                    timeScale: 1.0
                }
            });
        }
    }

    updateScore(points, combo = false) {
        const difficulty = GameDifficulty[this._state.settings.difficulty];
        const multiplier = this._state.gameplay.multiplier * difficulty.scoreMultiplier;
        
        this.setState({
            gameplay: {
                ...this._state.gameplay,
                score: this._state.gameplay.score + (points * multiplier),
                combo: combo ? this._state.gameplay.combo + 1 : 0,
                multiplier: combo ? Math.min(this._state.gameplay.multiplier + COMBO_MULTIPLIER_INCREMENT, MAX_COMBO_MULTIPLIER) : 1.0
            }
        });
    }

    gameOver() {
        this.setState({ 
            currentState: GameState.GAME_OVER,
            running: false 
        });
    }

    victory() {
        this.setState({ 
            currentState: GameState.VICTORY,
            running: false,
            victory: true 
        });
    }
}

export class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        
        // Core systems
        this.stateManager = new GameStateManager();
        this.achievements = new AchievementSystem();
        this.effects = new EffectSystem(canvas, ctx);
        this.particles = new ParticleSystem(canvas, ctx);
        this.powerups = new PowerupSystem();
        this.obstacles = new ObstacleSystem();
        this.sounds = new SoundManager();
        this.storage = new StorageManager();
        this.network = new NetworkManager();
        
        // Game objects
        this.bike = null;
        this.terrain = null;
        this.currentLevel = null;
        
        // Load saved state
        this._loadSavedState();
        
        // Time tracking
        this.lastTime = 0;
        this.frameCount = 0;
        this.fpsTime = 0;
        this.fps = 0;
        
        // Camera system
        this.camera = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            zoom: 1,
            rotation: 0,
            shake: {
                magnitude: 0,
                duration: 0,
                trauma: 0
            },
            smoothing: {
                position: CAMERA_POSITION_SMOOTHING,
                rotation: CAMERA_ROTATION_SMOOTHING,
                zoom: CAMERA_ZOOM_SMOOTHING
            }
        };

        // Level configuration
        this.worldBounds = {
            left: 0,
            right: WORLD_BOUNDS_RIGHT,
            top: WORLD_BOUNDS_TOP,  // Allow for air tricks
            bottom: canvas.height + WORLD_BOUNDS_BOTTOM_OFFSET  // Death zone buffer
        };
        
        // Game elements
        this.checkpoints = [];
        this.collectibles = [];
        this.obstacles = [];
        this.powerups = [];
        this.particles = [];
        
        // Performance monitoring
        this.metrics = {
            fps: [],
            frameTime: [],
            updateTime: [],
            renderTime: [],
            particleCount: 0
        };
        
        // Input state cache
        this.input = {
            keyboard: new Set(),
            gamepad: null,
            touch: {
                active: false,
                position: { x: 0, y: 0 }
            }
        };

        // Initialize systems
        this._initializeSystems();
        
        // Setup auto-save
        setInterval(() => this._saveGameState(), AUTO_SAVE_INTERVAL_MS);
        
        // Setup network sync
        this.network.setupSync(() => ({
            state: this.stateManager.state,
            achievements: this.achievements.getUnlockedAchievements()
        }));
    }
    
    _loadSavedState() {
        try {
            // Load settings
            const savedSettings = this.storage.get(SETTINGS_KEY);
            if (savedSettings) {
                this.stateManager.setState({
                    settings: {
                        ...this.stateManager.state.settings,
                        ...savedSettings
                    }
                });
            }
            
            // Load high scores
            const highScores = this.storage.get(HIGH_SCORES_KEY) || [];
            this.stateManager.setState({
                session: {
                    ...this.stateManager.state.session,
                    highScores
                }
            });
            
            // Load save game if exists and not expired
            const savedGame = this.storage.get(SAVE_GAME_KEY);
            if (savedGame && Date.now() - savedGame.timestamp < SAVE_GAME_EXPIRATION_MS) {
                this.stateManager.setState({
                    gameplay: {
                        ...this.stateManager.state.gameplay,
                        ...savedGame.gameplay
                    }
                });
            }
        } catch (error) {
            console.error('Error loading saved state:', error);
        }
    }
    
    _saveGameState() {
        try {
            const state = this.stateManager.state;
            
            // Save settings
            this.storage.set(SETTINGS_KEY, state.settings);
            
            // Save high scores
            this.storage.set(HIGH_SCORES_KEY, state.session.highScores);
            
            // Save game state if playing
            if (state.currentState === GameState.PLAYING) {
                this.storage.set(SAVE_GAME_KEY, {
                    timestamp: Date.now(),
                    gameplay: state.gameplay
                });
            }
            
            // Sync with network if online
            this.network.syncState({
                state: this.stateManager.state,
                achievements: this.achievements.getUnlockedAchievements()
            });
        } catch (error) {
            console.error('Error saving game state:', error);
        }
    }
    
    resetProgress() {
        // Clear all saved data
        this.storage.remove(SAVE_GAME_KEY);
        this.storage.remove(HIGH_SCORES_KEY);
        
        // Reset state but keep settings
        const settings = this.stateManager.state.settings;
        this.stateManager.reset(settings.difficulty);
        this.stateManager.setState({ settings });
        
        // Reset achievements
        this.achievements.reset();
        
        // Sync with network
        this.network.syncState({
            state: this.stateManager.state,
            achievements: []
        });
    }

    async start(options = {}) {
        try {
            const {
                difficulty = this.stateManager.state.settings.difficulty,
                level = DEFAULT_START_LEVEL,
                checkpoint = DEFAULT_START_CHECKPOINT,
                loadSave = true
            } = options;
            
            // Set loading state
            this.stateManager.setState({
                currentState: GameState.LOADING,
                loading: {
                    progress: 0,
                    total: LOADING_TOTAL_PROGRESS,
                    message: 'Initializing...'
                }
            });
            
            // Initialize or reset game state
            this.stateManager.reset(difficulty);
            
            // Load saved game if requested
            if (loadSave) {
                const savedGame = this.storage.get(SAVE_GAME_KEY);
                if (savedGame && savedGame.level === level) {
                    this.stateManager.setState({
                        gameplay: savedGame.gameplay
                    });
                }
            }
            
            // Update loading progress
            this._updateLoadingProgress(20, 'Generating level...');
            
            // Generate level
            this.currentLevel = new Level(this.canvas, {
                difficulty,
                level,
                checkpoint,
                seed: `${difficulty}-${level}-${Date.now()}`
            });
            
            const levelData = await this.currentLevel.generate();
            
            // Setup terrain
            this._updateLoadingProgress(40, 'Building terrain...');
            this.terrain = new Terrain(this.canvas);
            this.terrain.points = levelData.points;
            this.checkpoints = levelData.checkpoints;
            this.collectibles = levelData.collectibles;
            
            // Setup bike
            this._updateLoadingProgress(60, 'Setting up bike...');
            const startPoint = levelData.points[0];
            this.bike = new Bike(startPoint.x, startPoint.y, {
                color: 'cyan',
                gravity: this.stateManager.state.physics.gravity,
                friction: this.stateManager.state.physics.friction
            });
            
            // Setup sounds
            this._updateLoadingProgress(90, 'Loading sounds...');
            await this.loadSounds();
            
            // Finalize game state
            this.stateManager.setState({
                currentState: GameState.PLAYING,
                running: true,
                loading: {
                    progress: 100,
                    message: 'Game Ready!'
                }
            });
            
            // Setup pause handler
            this.setupPauseHandler();
            
            // Setup state change listener
            this.stateManager.addListener(this.handleStateChange.bind(this));
            
            // Start game loop
            this.lastTime = performance.now();
            requestAnimationFrame((t) => this.gameLoop(t));
            
            console.log('Game started successfully!');
        } catch (error) {
            console.error('Failed to start game:', error);
            this.stateManager.setState({
                currentState: GameState.MENU,
                loading: {
                    progress: 0,
                    message: `Error: ${error.message}`
                }
            });
        }
    }

    _updateLoadingProgress(progress, message) {
        this.stateManager.setState({
            loading: {
                ...this.stateManager.state.loading,
                progress,
                message
            }
        });
    }

    setupPauseHandler() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.stateManager.state.currentState === GameState.PLAYING) {
                    this.stateManager.pause();
                    this.onPause();
                } else if (this.stateManager.state.currentState === GameState.PAUSED) {
                    this.stateManager.resume();
                    this.onResume();
                }
            }
        });
    }

    handleStateChange(oldState, newState) {
        if (newState.currentState === GameState.PAUSED && oldState.currentState === GameState.PLAYING) {
            this.onPause();
        } else if (newState.currentState === GameState.PLAYING && oldState.currentState === GameState.PAUSED) {
            this.onResume();
        } else if (newState.currentState === GameState.GAME_OVER) {
            this.onGameOver();
        } else if (newState.currentState === GameState.VICTORY) {
            this.onVictory();
        }
    }

    onPause() {
        // Show pause menu UI
        // Example:
        // showPauseMenu({
        //     onResume: () => this.stateManager.resume(),
        //     onRestart: () => this.start(),
        //     onExit: () => this.stateManager.setState({ currentState: GameState.MENU })
        // });
    }

    onResume() {
        // Hide pause menu UI
    }

    onGameOver() {
        // Show game over UI
    }

    onVictory() {
        // Show victory UI
    }

    async loadSounds() {
        try {
            const soundFiles = {
                crash: './assets/crash.mp3',
                drive: './assets/drive.mp3',
                win: './assets/win.mp3'
            };
            
            for (const name in soundFiles) {
                if (soundFiles.hasOwnProperty(name)) {
                    const path = soundFiles[name];
                    await this.sounds.loadSound(name, path);
                }
            }
            console.log('Sounds loaded.');
        } catch (error) {
            console.error('Failed to load sounds:', error);
        }
    }

    setupMobileAudio() {
        // iOS and some Android browsers require user interaction to unlock audio
        const unlockAudio = () => {
            if (this.sounds.isAudioContextSuspended()) {
                this.sounds.resumeAudioContext();
                document.removeEventListener('touchstart', unlockAudio);
                document.removeEventListener('touchend', unlockAudio);
                document.removeEventListener('click', unlockAudio);
            }
        };
        document.addEventListener('touchstart', unlockAudio, { once: true });
        document.addEventListener('touchend', unlockAudio, { once: true });
        document.addEventListener('click', unlockAudio, { once: true });
    }

    updateCamera() {
        // Smoothly move camera towards bike
        this.camera.targetX = this.bike.x - this.canvas.width / CAMERA_X_OFFSET_DIVISOR;
        this.camera.targetY = this.bike.y - this.canvas.height / CAMERA_Y_OFFSET_DIVISOR;
        
        this.camera.x += (this.camera.targetX - this.camera.x) * CAMERA_POSITION_SMOOTHING;
        this.camera.y += (this.camera.targetY - this.camera.y) * CAMERA_POSITION_SMOOTHING;
        
        // Apply camera shake
        if (this.camera.shake.trauma > 0) {
            const shakeX = this.camera.shake.magnitude * this.camera.shake.trauma * (Math.random() * 2 - 1);
            const shakeY = this.camera.shake.magnitude * this.camera.shake.trauma * (Math.random() * 2 - 1);
            this.camera.x += shakeX;
            this.camera.y += shakeY;
            this.camera.shake.trauma = Math.max(0, this.camera.shake.trauma - CAMERA_SHAKE_TRAUMA_DECREMENT);
        }
    }

    drawCheckpoints() {
        this.checkpoints.forEach(cp => {
            if (!cp.reached) {
                this.ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
                this.ctx.fillRect(cp.x - this.camera.x, 0, 10, this.canvas.height);
            }
        });
    }

    drawUI() {
        // Draw score, time, health, etc.
        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px Arial'; // Consider making font sizes constants
        this.ctx.fillText(`Score: ${this.stateManager.state.gameplay.score.toFixed(0)}`, UI_TEXT_X_OFFSET, UI_SCORE_Y);
        this.ctx.fillText(`Time: ${(this.stateManager.state.gameplay.time / MS_TO_SECONDS_DIVISOR).toFixed(2)}s`, UI_TEXT_X_OFFSET, UI_TIME_Y);
        this.ctx.fillText(`Health: ${this.stateManager.state.gameplay.health.toFixed(0)}`, UI_TEXT_X_OFFSET, UI_HEALTH_Y);
        
        if (this.stateManager.state.settings.showFps) {
            this.ctx.fillText(`FPS: ${this.fps.toFixed(0)}`, this.canvas.width - FPS_TEXT_X_OFFSET, UI_SCORE_Y);
        }
        
        this._drawMainPanel();
        this._drawBoostMeter();
        this._drawHealthBar();
        this._drawMinimap();
    }

    async _initializeSystems() {
        this._updateLoadingProgress(10, 'Initializing systems...');
        await Promise.all([
            this.sounds.init(),
            this.network.init(),
            this.achievements.init()
        ]);
        this._generateStars(); // Call once during initialization
        this._generateClouds(); // Call once during initialization
        this._updateLoadingProgress(15, 'Systems initialized.');
    }

    _setupInputHandlers() {
        document.addEventListener('keydown', (e) => this._handleInputEvent(e));
        document.addEventListener('keyup', (e) => this._handleInputEvent(e));
        
        // Touch controls
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.input.touch.active = true;
            this.input.touch.position = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.input.touch.position = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.input.touch.active = false;
        });
    }

    _handleInputEvent(e) {
        const isKeyDown = e.type === 'keydown';
        if (isKeyDown) {
            this.input.keyboard.add(e.key);
        } else {
            this.input.keyboard.delete(e.key);
        }
        
        // Handle pause/resume
        if (e.key === 'Escape') {
            if (this.stateManager.state.currentState === GameState.PLAYING) {
                this.stateManager.pause();
            } else if (this.stateManager.state.currentState === GameState.PAUSED) {
                this.stateManager.resume();
            }
        }
    }

    _setupPerformanceMonitoring() {
        setInterval(() => {
            this.fps = this.frameCount;
            this.frameCount = 0;
        }, 1000);
    }

    gameLoop(timestamp) {
        const delta = (timestamp - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = timestamp;
        this.frameCount++;
        
        if (this.stateManager.state.running) {
            this.update(delta);
            this.draw();
        }
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(delta) {
        const actualDelta = delta * this.stateManager.state.physics.timeScale;
        
        // Update game state time
        this.stateManager.setState({ 
            gameplay: {
                ...this.stateManager.state.gameplay,
                time: this.stateManager.state.gameplay.time + (actualDelta * 1000)
            }
        });
        
        this._updatePhysics(actualDelta);
        this._updateGameObjects(actualDelta);
        this._checkCollisions();
        this._updateCamera(actualDelta);
        this._updateSounds();
        this._checkGameConditions();
    }

    _updatePhysics(delta) {
        // Apply gravity
        this.bike.applyForce(0, this.stateManager.state.physics.gravity * delta);
        
        // Apply friction (simplified)
        this.bike.vx *= (1 - this.stateManager.state.physics.friction * delta);
        this.bike.vy *= (1 - this.stateManager.state.physics.friction * delta);
        
        // Update bike position
        this.bike.update(delta, {
            gravity: this.stateManager.state.physics.gravity,
            friction: this.stateManager.state.physics.friction
        });
    }

    _updateGameObjects(delta) {
        // Update bike
        this.bike.update(delta);
        
        // Update particles
        this.particles.update(delta);
        
        // Update powerups
        this.powerups.update(delta);
        
        // Update obstacles
        this.obstacles.update(delta);
        
        // Update collectibles
        this.collectibles.forEach(c => {
            if (!c.collected && this.bike.collidesWith(c)) {
                c.collected = true;
                this.stateManager.setState({
                    gameplay: {
                        ...this.stateManager.state.gameplay,
                        coins: this.stateManager.state.gameplay.coins + 1
                    }
                });
                this.sounds.play('coin'); // Assuming a 'coin' sound exists
            }
        });
        
        // Update checkpoints
        this.checkpoints.forEach(cp => {
            if (!cp.reached && this.bike.x > cp.x) {
                cp.reached = true;
                this.stateManager.setState({
                    gameplay: {
                        ...this.stateManager.state.gameplay,
                        score: this.stateManager.state.gameplay.score + GameDifficulty[this.stateManager.state.settings.difficulty].checkpointBonus
                    }
                });
                this.sounds.play('checkpoint'); // Assuming a 'checkpoint' sound exists
            }
        });
    }

    _checkCollisions() {
        // Bike-terrain collision
        const terrainY = this.terrain.getHeightAt(this.bike.x);
        if (this.bike.y + this.bike.height / 2 > terrainY) {
            this.bike.y = terrainY - this.bike.height / 2;
            this.bike.vy = 0;
            this.bike.vx *= BIKE_DAMPING_FACTOR; // Simple damping
        }
        
        // Bike-hazard collision (handled by TerrainEffects)
        // Bike-obstacle collision
        this.obstacles.forEach(obstacle => {
            if (this.bike.collidesWith(obstacle)) {
                this.bike.health -= OBSTACLE_DAMAGE; // Example damage
                this.effects.playCollisionEffect(this.bike.x, this.bike.y, COLLISION_EFFECT_MAGNITUDE);
                this.sounds.play('crash');
                obstacle.active = false; // Remove obstacle after collision
            }
        });
        
        // Bike-powerup collision
        this.powerups.forEach(powerup => {
            if (this.bike.collidesWith(powerup)) {
                powerup.applyEffect(this.bike, this.stateManager);
                powerup.active = false; // Remove powerup after use
            }
        });
    }

    _updateCamera(delta) {
        // Smoothly move camera towards bike
        this.camera.targetX = this.bike.x - this.canvas.width / CAMERA_X_OFFSET_DIVISOR;
        this.camera.targetY = this.bike.y - this.canvas.height / CAMERA_Y_OFFSET_DIVISOR;
        
        this.camera.x += (this.camera.targetX - this.camera.x) * CAMERA_POSITION_SMOOTHING;
        this.camera.y += (this.camera.targetY - this.camera.y) * CAMERA_POSITION_SMOOTHING;
        
        // Apply camera shake
        if (this.camera.shake.trauma > 0) {
            const shakeX = this.camera.shake.magnitude * this.camera.shake.trauma * (Math.random() * 2 - 1);
            const shakeY = this.camera.shake.magnitude * this.camera.shake.trauma * (Math.random() * 2 - 1);
            this.camera.x += shakeX;
            this.camera.y += shakeY;
            this.camera.shake.trauma = Math.max(0, this.camera.shake.trauma - CAMERA_SHAKE_TRAUMA_DECREMENT);
        }
    }

    _updateSounds() {
        // Update continuous sounds like engine noise
        if (this.stateManager.state.running && this.bike.vx > MIN_BIKE_SPEED_FOR_DRIVE_SOUND) {
            this.sounds.play('drive', { loop: true, volume: Math.min(1, this.bike.vx / DRIVE_SOUND_VOLUME_DIVISOR) });
        } else {
            this.sounds.stop('drive');
        }
    }

    _checkGameConditions() {
        const state = this.stateManager.state;
        
        // Check for game over (health or time limit)
        if (state.gameplay.health <= MIN_HEALTH_FOR_GAME_OVER) {
            this.stateManager.gameOver();
            this.sounds.play('crash');
        } else if (state.gameplay.time / MS_TO_SECONDS_DIVISOR >= GameDifficulty[state.settings.difficulty].timeLimit) {
            this.stateManager.gameOver();
        }
        
        // Check for victory (all checkpoints reached)
        if (this.checkpoints.every(cp => cp.reached)) {
            this.stateManager.victory();
            this.sounds.play('win');
        }
    }
    
    handleGameOver() {
        // Logic for when game is over
        console.log('Game Over!');
        // Potentially show game over screen, save score, etc.
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        this._applyCameraTransform();
        
        this._drawBackground();
        this._drawWorldLayers();
        this._drawGameObjects();
        
        this.ctx.restore();
        
        this._drawUI();
        
        if (this.stateManager.state.currentState === GameState.PAUSED) {
            this._drawPausedOverlay();
        }
        
        if (this.stateManager.state.settings.showFps) {
            this._drawDebugInfo();
        }
    }

    _drawBackground() {
        // Simple sky gradient
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        skyGradient.addColorStop(0, '#87CEEB'); // Light blue sky
        skyGradient.addColorStop(1, '#ADD8E6'); // Lighter blue
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Stars and clouds are now generated once in _initializeSystems
    }

    _drawStars() {
        this.ctx.fillStyle = 'white'; // Consider making colors constants
        this.stars.forEach(star => {
            this.ctx.beginPath();
            this.ctx.arc(star.x - this.camera.x * star.parallax, star.y - this.camera.y * star.parallax, star.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    _generateStars() {
        this.stars = Array(NUM_STARS).fill(0).map(() => ({
            x: Math.random() * this.worldBounds.right,
            y: Math.random() * this.canvas.height / 2, // Consider making this a constant
            radius: Math.random() * MAX_STAR_RADIUS_OFFSET + MIN_STAR_RADIUS,
            parallax: Math.random() * MAX_STAR_PARALLAX_OFFSET + MIN_STAR_PARALLAX // Closer stars move more
        }));
    }

    _drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; // Consider making colors constants
        this.clouds.forEach(cloud => {
            this.ctx.beginPath();
            this.ctx.ellipse(cloud.x - this.camera.x * cloud.parallax, cloud.y - this.camera.y * cloud.parallax, cloud.width, cloud.height, 0, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    _generateClouds() {
        this.clouds = Array(NUM_CLOUDS).fill(0).map(() => ({
            x: Math.random() * this.worldBounds.right,
            y: Math.random() * this.canvas.height / 3, // Consider making this a constant
            width: Math.random() * MAX_CLOUD_WIDTH_OFFSET + MIN_CLOUD_WIDTH,
            height: Math.random() * MAX_CLOUD_HEIGHT_OFFSET + MIN_CLOUD_HEIGHT,
            parallax: Math.random() * MAX_CLOUD_PARALLAX_OFFSET + MIN_CLOUD_PARALLAX
        }));
    }

    _applyCameraTransform() {
        this.ctx.translate(-this.camera.x, -this.camera.y);
        // Apply zoom and rotation if needed
    }

    _drawWorldLayers() {
        // Draw terrain
        this.terrain.draw(this.ctx, this.camera.x);
        
        // Draw hazards (handled by TerrainEffects)
        // Draw obstacles
        this.obstacles.forEach(obstacle => obstacle.draw(this.ctx));
        
        // Draw powerups
        this.powerups.forEach(powerup => powerup.draw(this.ctx));
        
        this._drawCollectiblesWithEffects();
        
        this._drawCheckpointsWithGlow();
    }

    _drawGameObjects() {
        this.bike.draw(this.ctx);
        this.particles.draw(this.ctx);
        this.effects.draw(this.ctx);
        
        this._drawBikeShadow();
        this._drawBoostEffects();
    }

    _drawCheckpointsWithGlow() {
        this.checkpoints.forEach(cp => {
            if (!cp.reached) {
                this.ctx.save();
                this.ctx.shadowBlur = CHECKPOINT_GLOW_BLUR;
                this.ctx.shadowColor = 'cyan'; // Consider making colors constants
                this.ctx.fillStyle = 'rgba(0, 255, 255, 0.5)'; // Consider making colors constants
                this.ctx.fillRect(cp.x - this.camera.x, 0, 10, this.canvas.height); // Consider making width a constant
                this.ctx.restore();
            }
        });
    }

    _drawCollectiblesWithEffects() {
        this.collectibles.forEach(c => {
            if (!c.collected) {
                this.ctx.save();
                this.ctx.shadowBlur = COLLECTIBLE_GLOW_BLUR;
                this.ctx.shadowColor = 'gold'; // Consider making colors constants
                this.ctx.fillStyle = 'gold'; // Consider making colors constants
                this.ctx.beginPath();
                this.ctx.arc(c.x, c.y, COLLECTIBLE_RADIUS, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
                
                // Simple pulse effect
                const pulse = Math.sin(Date.now() / COLLECTIBLE_PULSE_SPEED) * COLLECTIBLE_PULSE_MIN_OFFSET + COLLECTIBLE_PULSE_MAX_OFFSET;
                this.ctx.beginPath();
                this.ctx.arc(c.x, c.y, pulse, 0, Math.PI * 2);
                this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)'; // Consider making colors constants
                this.ctx.lineWidth = COLLECTIBLE_PULSE_LINE_WIDTH;
                this.ctx.stroke();
            }
        });
    }

    _drawBikeShadow() {
        this.ctx.fillStyle = `rgba(0, 0, 0, ${BIKE_SHADOW_ALPHA})`;
        this.ctx.beginPath();
        this.ctx.ellipse(this.bike.x, this.terrain.getHeightAt(this.bike.x) + BIKE_SHADOW_Y_OFFSET, BIKE_SHADOW_WIDTH, BIKE_SHADOW_HEIGHT, 0, 0, Math.PI * 2);
        this.ctx.fill();
    }

    _drawBoostEffects() {
        if (this.stateManager.state.gameplay.boost > 0 && this.input.keyboard.has('Shift')) {
            this.effects.playBoostEffect(this.bike.x, this.bike.y);
        }
    }

    _drawUI() {
        // Draw score, time, health, etc.
        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px Arial'; // Consider making font sizes constants
        this.ctx.fillText(`Score: ${this.stateManager.state.gameplay.score.toFixed(0)}`, UI_TEXT_X_OFFSET, UI_SCORE_Y);
        this.ctx.fillText(`Time: ${(this.stateManager.state.gameplay.time / MS_TO_SECONDS_DIVISOR).toFixed(2)}s`, UI_TEXT_X_OFFSET, UI_TIME_Y);
        this.ctx.fillText(`Health: ${this.stateManager.state.gameplay.health.toFixed(0)}`, UI_TEXT_X_OFFSET, UI_HEALTH_Y);
        
        if (this.stateManager.state.settings.showFps) {
            this.ctx.fillText(`FPS: ${this.fps.toFixed(0)}`, this.canvas.width - FPS_TEXT_X_OFFSET, UI_SCORE_Y);
        }
        
        this._drawMainPanel();
        this._drawBoostMeter();
        this._drawHealthBar();
        this._drawMinimap();
    }

    _drawMainPanel() {
        // Draw a semi-transparent panel at the top right for stats
        const panelWidth = MAIN_PANEL_WIDTH;
        const panelHeight = MAIN_PANEL_HEIGHT;
        const panelX = this.canvas.width - panelWidth - MAIN_PANEL_X_OFFSET;
        const panelY = MAIN_PANEL_Y_OFFSET;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        this.ctx.fillStyle = 'white'; // Consider making colors constants
        this.ctx.font = '18px Arial'; // Consider making font sizes constants
        this.ctx.fillText(`Difficulty: ${this.stateManager.state.settings.difficulty}`, panelX + MAIN_PANEL_TEXT_X_OFFSET, panelY + MAIN_PANEL_DIFFICULTY_Y);
        this.ctx.fillText(`Level: ${this.stateManager.state.gameplay.level}`, panelX + MAIN_PANEL_TEXT_X_OFFSET, panelY + MAIN_PANEL_LEVEL_Y);
        this.ctx.fillText(`Coins: ${this.stateManager.state.gameplay.coins}`, panelX + MAIN_PANEL_TEXT_X_OFFSET, panelY + MAIN_PANEL_COINS_Y);
        this.ctx.fillText(`Checkpoints: ${this.stateManager.state.gameplay.checkpoint}/${this.checkpoints.length}`, panelX + MAIN_PANEL_TEXT_X_OFFSET, panelY + MAIN_PANEL_CHECKPOINTS_Y);
    }

    _drawBoostMeter() {
        const meterWidth = BOOST_METER_WIDTH;
        const meterHeight = BOOST_METER_HEIGHT;
        const meterX = this.canvas.width / 2 - meterWidth / 2;
        const meterY = this.canvas.height - BOOST_METER_Y_OFFSET;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
        
        // Boost bar
        const boostFillWidth = (this.stateManager.state.gameplay.boost / 100) * meterWidth;
        this.ctx.fillStyle = 'lime'; // Consider making colors constants
        this.ctx.fillRect(meterX, meterY, boostFillWidth, meterHeight);
        
        // Text
        this.ctx.fillStyle = 'white'; // Consider making colors constants
        this.ctx.font = '14px Arial'; // Consider making font sizes constants
        this.ctx.fillText(`BOOST: ${this.stateManager.state.gameplay.boost.toFixed(0)}%`, meterX + BOOST_METER_TEXT_X_OFFSET, meterY + BOOST_METER_TEXT_Y_OFFSET);
    }

    _drawHealthBar() {
        const barWidth = HEALTH_BAR_WIDTH;
        const barHeight = HEALTH_BAR_HEIGHT;
        const barX = HEALTH_BAR_X_OFFSET;
        const barY = this.canvas.height - HEALTH_BAR_Y_OFFSET;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health bar
        const healthFillWidth = (this.stateManager.state.gameplay.health / 100) * barWidth;
        this.ctx.fillStyle = healthFillWidth > barWidth * HEALTH_BAR_COLOR_THRESHOLD ? 'red' : 'darkred'; // Consider making colors constants
        this.ctx.fillRect(barX, barY, healthFillWidth, barHeight);
        
        // Text
        this.ctx.fillStyle = 'white'; // Consider making colors constants
        this.ctx.font = '14px Arial'; // Consider making font sizes constants
        this.ctx.fillText(`HEALTH: ${this.stateManager.state.gameplay.health.toFixed(0)}%`, barX + HEALTH_BAR_TEXT_X_OFFSET, barY + HEALTH_BAR_TEXT_Y_OFFSET);
    }

    _drawMinimap() {
        const minimapWidth = MINIMAP_WIDTH;
        const minimapHeight = MINIMAP_HEIGHT;
        const minimapX = this.canvas.width - minimapWidth - MINIMAP_X_OFFSET;
        const minimapY = this.canvas.height - minimapHeight - MINIMAP_Y_OFFSET;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(minimapX, minimapY, minimapWidth, minimapHeight);
        
        // Draw terrain on minimap
        this.ctx.save();
        this.ctx.translate(minimapX, minimapY);
        this.ctx.scale(minimapWidth / this.currentLevel.width, minimapHeight / this.canvas.height);
        
        this.ctx.strokeStyle = 'white'; // Consider making colors constants
        this.ctx.lineWidth = MINIMAP_LINE_WIDTH;
        this.ctx.beginPath();
        this.currentLevel.points.forEach((p, i) => {
            if (i === 0) {
                this.ctx.moveTo(p.x, p.y);
            } else {
                this.ctx.lineTo(p.x, p.y);
            }
        });
        this.ctx.stroke();
        
        // Draw bike on minimap
        this.ctx.fillStyle = 'red'; // Consider making colors constants
        this.ctx.beginPath();
        this.ctx.arc(this.bike.x, this.bike.y, MINIMAP_BIKE_RADIUS, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    _drawPausedOverlay() {
        this.ctx.fillStyle = `rgba(0, 0, 0, ${PAUSED_OVERLAY_ALPHA})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white'; // Consider making colors constants
        this.ctx.font = PAUSED_TEXT_FONT;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.textAlign = 'left'; // Reset
    }

    _drawDebugInfo() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Consider making colors constants
        this.ctx.fillRect(this.canvas.width - DEBUG_PANEL_X_OFFSET, DEBUG_PANEL_Y_OFFSET, DEBUG_PANEL_WIDTH, DEBUG_PANEL_HEIGHT);
        
        this.ctx.fillStyle = 'white'; // Consider making colors constants
        this.ctx.font = '14px Arial'; // Consider making font sizes constants
        let debugY = DEBUG_TEXT_START_Y;
        const lineHeight = DEBUG_TEXT_LINE_HEIGHT;
        
        this.ctx.fillText(`Bike X: ${this.bike.x.toFixed(1)}`, this.canvas.width - DEBUG_TEXT_X_OFFSET, debugY);
        debugY += lineHeight;
        this.ctx.fillText(`Bike Y: ${this.bike.y.toFixed(1)}`, this.canvas.width - DEBUG_TEXT_X_OFFSET, debugY);
        debugY += lineHeight;
        this.ctx.fillText(`Camera X: ${this.camera.x.toFixed(1)}`, this.canvas.width - DEBUG_TEXT_X_OFFSET, debugY);
        debugY += lineHeight;
        this.ctx.fillText(`Camera Y: ${this.camera.y.toFixed(1)}`, this.canvas.width - DEBUG_TEXT_X_OFFSET, debugY);
        debugY += lineHeight;
        this.ctx.fillText(`State: ${this.stateManager.state.currentState}`, this.canvas.width - DEBUG_TEXT_X_OFFSET, debugY);
    }
}
