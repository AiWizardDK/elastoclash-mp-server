// js/daily.js

/**
 * Daily Challenge System
 * Håndterer daglige udfordringer, baner og statistik
 */

const DIFFICULTY_WEIGHTS = {
    EASY: 0.3,
    MEDIUM: 0.4,
    HARD: 0.2,
    EXTREME: 0.1
};

const MODIFIER_TYPES = {
    PHYSICS: {
        GRAVITY: { min: 0.5, max: 1.5, name: "Tyngdekraft" },
        WIND: { min: -3, max: 3, name: "Vind" },
        FRICTION: { min: 0.7, max: 1.3, name: "Friktion" },
        BOUNCE: { min: 0.5, max: 2.0, name: "Sprængkraft" }
    },
    GAMEPLAY: {
        TIME_MULTIPLIER: { min: 0.8, max: 1.2, name: "Tidsfaktor" },
        COIN_VALUE: { min: 1, max: 3, name: "Møntværdi" },
        CHECKPOINT_BONUS: { min: 1, max: 2, name: "Checkpoint Bonus" }
    },
    SPECIAL: {
        LOW_GRAVITY: { value: 0.3, name: "Månegravitation" },
        SUPER_SPEED: { value: 1.5, name: "Superhastighed" },
        MEGA_JUMP: { value: 2.0, name: "Superhop" },
        NIGHT_MODE: { value: true, name: "Nattetid" },
        MIRROR_MODE: { value: true, name: "Spejlverden" }
    }
};

const STREAK_REWARDS = {
    3: { coins: 100, title: "Dedicated Rider" },
    7: { coins: 300, special_item: 'rainbow_trail', title: "Weekly Warrior" },
    14: { coins: 700, special_item: 'golden_bike', title: "Streak Master" },
    30: { coins: 2000, special_item: 'phoenix_bike', title: "Legend" }
};

/**
 * Repræsenterer en daglig udfordring
 * @typedef {Object} DailyChallenge
 * @property {string} name - Banens navn
 * @property {string} data - Banedata
 * @property {string} difficulty - Sværhedsgrad
 * @property {Object} modifiers - Specielle regler for dagen
 * @property {Object} rewards - Belønninger for gennemførelse
 * @property {Object} streakInfo - Information om brugerens streak
 * @property {Object} objectives - Dagens ekstra mål
 * @property {Object} weatherEffects - Vejreffekter for banen
 */

/**
 * Genererer en unik seed baseret på dagens dato
 * @returns {string} Unik daglig seed
 */
export function getDailySeed() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Pseudo-random number generator baseret på seed
 * @param {string} seed - Input seed
 * @returns {function} Generator funktion der returnerer tal mellem 0 og 1
 */
function createSeededRandom(seed) {
    const hash = hashCode(seed);
    let state = hash;
    
    return function() {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 4294967296;
    };
}

/**
 * Hash funktion for konsistent seed generering
 * @param {string} str - Input streng
 * @returns {number} Hash værdi
 */
function hashCode(str) {
    return str.split('').reduce((hash, char) => {
        hash = ((hash << 5) - hash) + char.charCodeAt(0);
        return hash >>> 0;
    }, 0);
}

// Prædefinerede baner med sværhedsgrader
const WEATHER_EFFECTS = {
    CLEAR: { name: "Solskin", visibility: 1.0, friction: 1.0 },
    RAIN: { name: "Regnvejr", visibility: 0.8, friction: 0.8 },
    SNOW: { name: "Snevejr", visibility: 0.7, friction: 0.6 },
    STORM: { name: "Storm", visibility: 0.5, wind: 2.0 },
    FOG: { name: "Tåge", visibility: 0.4, friction: 0.9 }
};

const DAILY_LEVELS = [
    {
        name: "Morning Warmup",
        data: "terrain_data_1",
        difficulty: "EASY",
        modifiers: {},
        rewards: { xp: 100, coins: 50 },
        objectives: [
            { type: "TIME", target: 60, reward: { coins: 25 } },
            { type: "COINS", target: 10, reward: { xp: 50 } }
        ]
    },
    {
        name: "Mountain Path",
        data: "terrain_data_2",
        difficulty: "MEDIUM",
        modifiers: { gravity: 1.1 },
        rewards: { xp: 150, coins: 75 },
        objectives: [
            { type: "NO_CRASH", reward: { special_item: 'mountain_tires' } }
        ]
    },
    {
        name: "The Loop",
        data: "terrain_data_3",
        difficulty: "MEDIUM",
        modifiers: { speed: 1.2 },
        rewards: { xp: 150, coins: 75 },
        objectives: [
            { type: "AIRTIME", target: 10, reward: { special_item: 'loop_master' } }
        ]
    },
    {
        name: "Desert Sprint",
        data: "terrain_data_4",
        difficulty: "HARD",
        modifiers: { friction: 0.8 },
        rewards: { xp: 200, coins: 100 },
        objectives: [
            { type: "SPEED", target: 50, reward: { special_item: 'speed_aura' } }
        ]
    },
    {
        name: "Gravity Challenge",
        data: "terrain_data_5",
        difficulty: "EXTREME",
        modifiers: { gravity: 0.5, wind: 2 },
        rewards: { xp: 300, coins: 150, special_item: 'gravity_bike' },
        objectives: [
            { type: "ALL_CHECKPOINTS", reward: { special_item: 'galaxy_trail' } }
        ]
    },
    {
        name: "Ice Cave",
        data: "terrain_data_6",
        difficulty: "HARD",
        modifiers: { friction: 0.5 },
        rewards: { xp: 250, coins: 125 },
        objectives: [
            { type: "PERFECT_RUN", reward: { special_item: 'ice_bike' } }
        ]
    },
    {
        name: "Volcano Run",
        data: "terrain_data_7",
        difficulty: "EXTREME",
        modifiers: { gravity: 1.2, wind: -1 },
        rewards: { xp: 350, coins: 175, special_item: 'lava_bike' },
        objectives: [
            { type: "SPEED_AND_COINS", target: { speed: 40, coins: 20 }, reward: { title: "Volcano Master" } }
        ]
    }
];

/**
 * Genererer dagens udfordring med forskellige modifiers
 * @returns {DailyChallenge} Dagens udfordring
 */
export function generateDailyLevel() {
    const seed = getDailySeed();
    const random = createSeededRandom(seed);
    
    // Vælg sværhedsgrad baseret på vægtning
    const difficulty = selectDifficulty(random());
    
    // Filtrer baner efter sværhedsgrad
    const possibleLevels = DAILY_LEVELS.filter(l => l.difficulty === difficulty);
    
    // Vælg en tilfældig bane fra den valgte sværhedsgrad
    const selectedLevel = possibleLevels[Math.floor(random() * possibleLevels.length)];
    
    // Tilføj daglige modifiers
    const dailyModifiers = generateDailyModifiers(random);
    
    return {
        ...selectedLevel,
        date: new Date().toISOString().split('T')[0],
        modifiers: { ...selectedLevel.modifiers, ...dailyModifiers },
        timeLimit: calculateTimeLimit(selectedLevel.difficulty),
        leaderboard: []
    };
}

/**
 * Vælger sværhedsgrad baseret på vægtning
 * @param {number} random - Random tal mellem 0-1
 * @returns {string} Valgt sværhedsgrad
 */
function selectDifficulty(random) {
    let sum = 0;
    for (const [difficulty, weight] of Object.entries(DIFFICULTY_WEIGHTS)) {
        sum += weight;
        if (random < sum) return difficulty;
    }
    return "MEDIUM"; // Fallback
}

/**
 * Genererer daglige modifiers og vejreffekter
 * @param {function} random - Seeded random funktion
 * @returns {Object} Dagens modifiers og vejr
 */
function generateDailyModifiers(random) {
    const modifiers = {};
    
    // Vælg tilfældigt vejr
    const weatherTypes = Object.keys(WEATHER_EFFECTS);
    const todaysWeather = WEATHER_EFFECTS[weatherTypes[Math.floor(random() * weatherTypes.length)]];
    
    // Tilføj vejreffekter til modifiers
    modifiers.weather = todaysWeather;
    if (todaysWeather.friction) modifiers.friction = todaysWeather.friction;
    if (todaysWeather.wind) modifiers.wind = todaysWeather.wind;
    
    // Tilføj physics modifiers (20% chance for hver)
    for (const [type, settings] of Object.entries(MODIFIER_TYPES.PHYSICS)) {
        if (random() < 0.2) {
            modifiers[type.toLowerCase()] = settings.min + random() * (settings.max - settings.min);
        }
    }
    
    // Tilføj gameplay modifiers (15% chance for hver)
    for (const [type, settings] of Object.entries(MODIFIER_TYPES.GAMEPLAY)) {
        if (random() < 0.15) {
            modifiers[type.toLowerCase()] = settings.min + random() * (settings.max - settings.min);
        }
    }
    
    // Tilføj special modifiers (10% chance for én)
    if (random() < 0.1) {
        const specialTypes = Object.entries(MODIFIER_TYPES.SPECIAL);
        const selectedSpecial = specialTypes[Math.floor(random() * specialTypes.length)];
        modifiers[selectedSpecial[0].toLowerCase()] = selectedSpecial[1].value;
    }
    
    // Tilføj unikke daglige objectives
    modifiers.objectives = generateDailyObjectives(random);
    
    return modifiers;
}

/**
 * Genererer daglige mål baseret på banens sværhedsgrad
 * @param {function} random - Seeded random funktion
 * @returns {Array} Liste af dagens mål
 */
function generateDailyObjectives(random) {
    const objectives = [];
    
    const possibleObjectives = [
        { type: "TIME_TRIAL", description: "Gennemfør banen under {target} sekunder" },
        { type: "COIN_COLLECTOR", description: "Saml {target} mønter" },
        { type: "PERFECT_RUN", description: "Gennemfør uden at styrte" },
        { type: "SPEED_DEMON", description: "Nå en tophastighed på {target}" },
        { type: "AIR_TIME", description: "Vær i luften i {target} sekunder total" },
        { type: "STUNT_MASTER", description: "Lav {target} flips" }
    ];
    
    // Vælg 2-3 objectives
    const numObjectives = 2 + (random() < 0.3 ? 1 : 0);
    
    for (let i = 0; i < numObjectives; i++) {
        const objective = possibleObjectives[Math.floor(random() * possibleObjectives.length)];
        
        // Tilføj målværdier baseret på objective type
        switch (objective.type) {
            case "TIME_TRIAL":
                objective.target = Math.floor(30 + random() * 30);
                break;
            case "COIN_COLLECTOR":
                objective.target = Math.floor(5 + random() * 15);
                break;
            case "SPEED_DEMON":
                objective.target = Math.floor(30 + random() * 20);
                break;
            case "AIR_TIME":
                objective.target = Math.floor(5 + random() * 10);
                break;
            case "STUNT_MASTER":
                objective.target = Math.floor(3 + random() * 5);
                break;
        }
        
        // Tilføj belønning
        objective.reward = {
            coins: Math.floor(50 + random() * 100),
            xp: Math.floor(25 + random() * 50)
        };
        
        // 10% chance for special item som belønning
        if (random() < 0.1) {
            const specialItems = ['trick_bike', 'golden_wheels', 'rainbow_trail', 'stunt_helmet'];
            objective.reward.special_item = specialItems[Math.floor(random() * specialItems.length)];
        }
        
        objectives.push(objective);
    }
    
    return objectives;
}

/**
 * Beregner tidsbegrænsning baseret på sværhedsgrad
 * @param {string} difficulty - Banens sværhedsgrad
 * @returns {number} Tidsgrænse i sekunder
 */
function calculateTimeLimit(difficulty) {
    const baseTimes = {
        EASY: 120,
        MEDIUM: 180,
        HARD: 240,
        EXTREME: 300
    };
    return baseTimes[difficulty] || 180;
}

// Data struktur til at gemme daglige stats
let dailyStats = {
    lastPlayed: null,
    attempts: 0,
    bestTime: null,
    completed: false,
    streak: {
        current: 0,
        best: 0,
        lastCompleted: null
    },
    objectives: {
        completed: [],
        total: 0
    },
    seasonStats: {
        totalCompleted: 0,
        totalCoins: 0,
        bestStreak: 0,
        titlesEarned: []
    }
};

/**
 * Tjekker og opdaterer streak status
 * @returns {Object} Streak information og eventuelle belønninger
 */
function updateStreak() {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (dailyStats.streak.lastCompleted === yesterday) {
        dailyStats.streak.current++;
        if (dailyStats.streak.current > dailyStats.streak.best) {
            dailyStats.streak.best = dailyStats.streak.current;
            dailyStats.seasonStats.bestStreak = dailyStats.streak.best;
        }
    } else if (dailyStats.streak.lastCompleted !== today) {
        dailyStats.streak.current = 1; // Start ny streak
    }
    
    dailyStats.streak.lastCompleted = today;
    
    // Check for streak rewards
    const rewards = [];
    for (const [days, reward] of Object.entries(STREAK_REWARDS)) {
        if (dailyStats.streak.current === parseInt(days)) {
            rewards.push({ days: parseInt(days), ...reward });
            if (reward.title && !dailyStats.seasonStats.titlesEarned.includes(reward.title)) {
                dailyStats.seasonStats.titlesEarned.push(reward.title);
            }
        }
    }
    
    return { currentStreak: dailyStats.streak.current, rewards };
}

/**
 * Opdaterer statistik for dagens udfordring
 * @param {Object} result - Resultatet af forsøget
 * @returns {Object} Opdateret statistik og belønninger
 */
export function updateDailyStats(result) {
    const today = new Date().toISOString().split('T')[0];
    
    // Nulstil stats hvis det er en ny dag
    if (dailyStats.lastPlayed !== today) {
        dailyStats = {
            ...dailyStats,
            lastPlayed: today,
            attempts: 0,
            bestTime: null,
            completed: false,
            objectives: {
                completed: [],
                total: result.objectives?.length || 0
            }
        };
    }
    
    dailyStats.attempts++;
    
    const rewards = {
        coins: 0,
        xp: 0,
        items: [],
        titles: [],
        streak: null
    };
    
    if (result.completed) {
        // Grundlæggende completion rewards
        rewards.coins += result.rewards.coins;
        rewards.xp += result.rewards.xp;
        if (result.rewards.special_item) {
            rewards.items.push(result.rewards.special_item);
        }
        
        // Opdater completion status og bedste tid
        dailyStats.completed = true;
        if (!dailyStats.bestTime || result.time < dailyStats.bestTime) {
            dailyStats.bestTime = result.time;
        }
        
        // Tjek objectives
        if (result.objectives) {
            result.objectives.forEach(objective => {
                if (objective.completed && !dailyStats.objectives.completed.includes(objective.type)) {
                    dailyStats.objectives.completed.push(objective.type);
                    if (objective.reward) {
                        rewards.coins += objective.reward.coins || 0;
                        rewards.xp += objective.reward.xp || 0;
                        if (objective.reward.special_item) {
                            rewards.items.push(objective.reward.special_item);
                        }
                        if (objective.reward.title) {
                            rewards.titles.push(objective.reward.title);
                        }
                    }
                }
            });
        }
        
        // Opdater streak og sæson statistik
        const streakInfo = updateStreak();
        if (streakInfo.rewards.length > 0) {
            rewards.streak = streakInfo;
        }
        
        dailyStats.seasonStats.totalCompleted++;
        dailyStats.seasonStats.totalCoins += rewards.coins;
    }
    
    // Gem stats
    localStorage.setItem('dailyStats', JSON.stringify(dailyStats));
    
    return { stats: dailyStats, rewards };
}

/**
 * Henter dagens udfordring og stats
 * @returns {Object} Dagens udfordring og statistik
 */
export function getTodaysLevel() {
    // Indlæs gemte stats
    const savedStats = localStorage.getItem('dailyStats');
    if (savedStats) {
        dailyStats = JSON.parse(savedStats);
    }
    
    const level = generateDailyLevel();
    return {
        ...level,
        stats: dailyStats,
        isNew: dailyStats.lastPlayed !== new Date().toISOString().split('T')[0]
    };
}
